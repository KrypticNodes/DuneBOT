import { Connection, PublicKey, ParsedTransactionWithMeta, GetVersionedTransactionConfig, ParsedInstruction } from '@solana/web3.js';
import WebSocket from 'ws';

interface MonitoredWallet {
  address: string;
  nickname: string;
  subscriptionIds: number[];
  tokenAccounts: Set<string>;
}

interface ParsedTransaction {
  signature: string;
  timestamp: string;
  type: 'buy' | 'sell' | 'transfer' | 'mint';
  tokenMint: string;
  tokenName: string;
  amount: number;
  sourceAddress: string;
  destinationAddress: string;
  isNewMint: boolean;
  isMintOperation: boolean; // True minting vs just receiving tokens
}

const SPL_TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const ASSOCIATED_TOKEN_PROGRAM_ID = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';

export class SolanaMonitorV2 {
  private connection: Connection;
  private wsConnection: Connection;
  private heliusApiKey: string;
  private knownMints: Map<string, { firstSeen: number; supply: string }> = new Map();
  private monitoredWallets: Map<string, MonitoredWallet> = new Map();
  private processedSignatures: Set<string> = new Set();
  private callbacks: {
    onTransaction?: (walletAddress: string, tx: ParsedTransaction) => void;
    onNewMint?: (walletAddress: string, mint: string, tx: ParsedTransaction) => void;
    onError?: (error: Error) => void;
  } = {};
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;

  constructor() {
    this.heliusApiKey = process.env.HELIUS_API_KEY || '';
    
    const heliusUrl = this.heliusApiKey 
      ? `https://mainnet.helius-rpc.com/?api-key=${this.heliusApiKey}`
      : 'https://api.mainnet-beta.solana.com';
    
    this.connection = new Connection(heliusUrl, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    });

    this.wsConnection = new Connection('https://api.mainnet-beta.solana.com', {
      commitment: 'confirmed',
      wsEndpoint: 'wss://api.mainnet-beta.solana.com',
    });

    console.log('✅ Solana Monitor V2 initialized');
    console.log(`📡 HTTP RPC: ${this.heliusApiKey ? 'Helius (Free Tier)' : 'Public'}`);
    console.log(`🔌 WebSocket: Public endpoint`);
  }

  setCallbacks(callbacks: typeof this.callbacks) {
    this.callbacks = callbacks;
  }

  async addWallet(address: string, nickname: string): Promise<void> {
    if (this.monitoredWallets.has(address)) {
      console.log(`⚠️  Wallet ${nickname} already monitored`);
      return;
    }

    try {
      const publicKey = new PublicKey(address);
      const subscriptionIds: number[] = [];

      // Subscribe to main wallet account for SOL transfers
      const accountSubId = this.wsConnection.onAccountChange(
        publicKey,
        (accountInfo, context) => {
          console.log(`💰 SOL balance change for ${nickname} at slot ${context.slot}`);
        },
        'confirmed'
      );
      subscriptionIds.push(accountSubId);

      // Subscribe to transaction logs (catches all activity including token ops)
      const logsSubId = this.wsConnection.onLogs(
        publicKey,
        async (logs) => {
          if (logs.err) {
            return;
          }
          
          // Deduplicate
          if (this.processedSignatures.has(logs.signature)) {
            return;
          }
          this.processedSignatures.add(logs.signature);
          
          console.log(`📝 TX for ${nickname}: ${logs.signature.slice(0, 8)}...`);
          await this.processTransaction(address, logs.signature);
        },
        'confirmed'
      );
      subscriptionIds.push(logsSubId);

      // Discover and subscribe to token accounts (where SPL tokens are held)
      const tokenAccounts = new Set<string>();
      try {
        const tokenAccountsResponse = await this.connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: new PublicKey(SPL_TOKEN_PROGRAM_ID) },
          'confirmed'
        );

        for (const { pubkey } of tokenAccountsResponse.value) {
          const tokenAccountAddress = pubkey.toBase58();
          tokenAccounts.add(tokenAccountAddress);
          
          // Subscribe to each token account
          const tokenAcctSubId = this.wsConnection.onAccountChange(
            pubkey,
            async (accountInfo, context) => {
              console.log(`🪙 Token account change for ${nickname} at slot ${context.slot}`);
            },
            'confirmed'
          );
          subscriptionIds.push(tokenAcctSubId);
        }
        
        console.log(`  ├─ Found ${tokenAccounts.size} token accounts`);
      } catch (error) {
        console.log(`  ├─ Could not fetch token accounts (will still catch via logs)`);
      }

      this.monitoredWallets.set(address, {
        address,
        nickname,
        subscriptionIds,
        tokenAccounts,
      });

      console.log(`✅ Monitoring ${nickname} (${address.slice(0, 8)}...) with ${subscriptionIds.length} subscriptions`);
      this.reconnectAttempts.set(address, 0);

      // Fetch limited recent transactions (avoid rate limits)
      setTimeout(() => this.fetchRecentTransactions(address, 5), 2000);
    } catch (error) {
      console.error(`❌ Failed to add wallet ${nickname}:`, error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error as Error);
      }
    }
  }

  async removeWallet(address: string): Promise<void> {
    const wallet = this.monitoredWallets.get(address);
    if (!wallet) return;

    for (const subId of wallet.subscriptionIds) {
      try {
        await this.wsConnection.removeAccountChangeListener(subId);
      } catch (e) {
        // Subscription may already be closed
      }
    }

    this.monitoredWallets.delete(address);
    console.log(`🛑 Stopped monitoring ${address.slice(0, 8)}...`);
  }

  private async fetchRecentTransactions(address: string, limit: number = 5): Promise<void> {
    try {
      const publicKey = new PublicKey(address);
      const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit });

      for (const sigInfo of signatures) {
        if (!this.processedSignatures.has(sigInfo.signature)) {
          this.processedSignatures.add(sigInfo.signature);
          await this.processTransaction(address, sigInfo.signature);
        }
      }
    } catch (error: any) {
      if (error.message?.includes('429')) {
        console.log(`⏸️  Rate limited fetching history for ${address.slice(0, 8)}... (will catch live)`);
      } else {
        console.error(`Error fetching transactions for ${address}:`, error);
      }
    }
  }

  private async processTransaction(walletAddress: string, signature: string): Promise<void> {
    try {
      const config: GetVersionedTransactionConfig = {
        maxSupportedTransactionVersion: 0,
      };
      
      const tx = await this.connection.getParsedTransaction(signature, config);
      
      if (!tx || !tx.meta) {
        return;
      }

      // Check if this is a mint operation by examining instructions
      const isMintOperation = this.isMintInstruction(tx);
      
      // Parse all token balance changes for this wallet
      const parsedTransactions = this.parseAllTokenChanges(walletAddress, signature, tx, isMintOperation);
      
      for (const parsedTx of parsedTransactions) {
        // Check if this token mint is new to the blockchain (not just new to wallet)
        if (parsedTx.isMintOperation || parsedTx.type === 'mint') {
          await this.checkIfNewMint(walletAddress, parsedTx);
        }

        if (this.callbacks.onTransaction) {
          this.callbacks.onTransaction(walletAddress, parsedTx);
        }
      }
    } catch (error: any) {
      if (!error.message?.includes('429')) {
        console.error(`Error processing transaction ${signature.slice(0, 8)}...:`, error);
      }
    }
  }

  private isMintInstruction(tx: ParsedTransactionWithMeta): boolean {
    if (!tx.transaction.message.instructions) return false;

    for (const instruction of tx.transaction.message.instructions) {
      const parsed = instruction as ParsedInstruction;
      
      // Check for MintTo instruction in SPL Token program
      if (parsed.program === 'spl-token' && parsed.parsed?.type === 'mintTo') {
        return true;
      }

      // Check for InitializeMint (brand new token creation)
      if (parsed.program === 'spl-token' && parsed.parsed?.type === 'initializeMint') {
        return true;
      }

      // Check for common DEX program patterns (Raydium, Jupiter, Pump.fun)
      // These often involve minting LP tokens or new tokens
      const programId = 'programId' in instruction ? instruction.programId.toBase58() : '';
      if (programId === '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8') { // Raydium
        return true;
      }
    }

    return false;
  }

  private parseAllTokenChanges(
    walletAddress: string,
    signature: string,
    tx: ParsedTransactionWithMeta,
    isMintOperation: boolean
  ): ParsedTransaction[] {
    if (!tx.meta || !tx.blockTime) return [];

    const results: ParsedTransaction[] = [];
    const preBalances = tx.meta.preTokenBalances || [];
    const postBalances = tx.meta.postTokenBalances || [];

    // Track which mints we've already processed to avoid duplicates
    const processedMints = new Set<string>();

    for (const postBalance of postBalances) {
      if (!postBalance.uiTokenAmount || !postBalance.mint) continue;
      if (processedMints.has(postBalance.mint)) continue;

      const preBalance = preBalances.find(
        (pre) => pre.accountIndex === postBalance.accountIndex && pre.mint === postBalance.mint
      );

      const postAmount = postBalance.uiTokenAmount.uiAmount || 0;
      const preAmount = preBalance?.uiTokenAmount?.uiAmount || 0;
      const change = postAmount - preAmount;

      if (Math.abs(change) < 0.000001) continue;

      processedMints.add(postBalance.mint);

      let type: 'buy' | 'sell' | 'transfer' | 'mint';
      let sourceAddress = '';
      let destinationAddress = '';

      if (isMintOperation && change > 0) {
        type = 'mint';
        sourceAddress = 'Mint Authority';
        destinationAddress = walletAddress;
      } else if (!preBalance || preAmount === 0) {
        type = 'buy';
        sourceAddress = 'DEX/Transfer';
        destinationAddress = walletAddress;
      } else if (change > 0) {
        type = 'buy';
        sourceAddress = 'DEX/Transfer';
        destinationAddress = walletAddress;
      } else {
        type = 'sell';
        sourceAddress = walletAddress;
        destinationAddress = 'DEX/Transfer';
      }

      results.push({
        signature,
        timestamp: new Date(tx.blockTime * 1000).toISOString(),
        type,
        tokenMint: postBalance.mint,
        tokenName: postBalance.mint.slice(0, 6),
        amount: Math.abs(change),
        sourceAddress,
        destinationAddress,
        isNewMint: false, // Will be set by checkIfNewMint
        isMintOperation,
      });
    }

    return results;
  }

  private async checkIfNewMint(walletAddress: string, tx: ParsedTransaction): Promise<void> {
    const mint = tx.tokenMint;
    
    // If we've seen this mint before, it's not new
    if (this.knownMints.has(mint)) {
      return;
    }

    try {
      // Check token supply and age
      const publicKey = new PublicKey(mint);
      const supply = await this.connection.getTokenSupply(publicKey);
      
      // Mark as known
      this.knownMints.set(mint, {
        firstSeen: Date.now(),
        supply: supply.value.uiAmount?.toString() || '0',
      });

      // This is a NEW mint!
      tx.isNewMint = true;
      
      console.log(`🆕🆕🆕 BRAND NEW MINT DETECTED! 🆕🆕🆕`);
      console.log(`  ├─ Token: ${mint.slice(0, 12)}...`);
      console.log(`  ├─ Wallet: ${walletAddress.slice(0, 12)}...`);
      console.log(`  ├─ Supply: ${supply.value.uiAmount?.toLocaleString() || 'Unknown'}`);
      console.log(`  ├─ Amount Received: ${tx.amount.toLocaleString()}`);
      console.log(`  └─ Type: ${tx.isMintOperation ? 'MINTING OPERATION' : 'First Appearance'}`);
      
      if (this.callbacks.onNewMint) {
        this.callbacks.onNewMint(walletAddress, mint, tx);
      }
    } catch (error: any) {
      // If we can't get supply, assume it's new and flag it anyway
      if (!error.message?.includes('429')) {
        console.log(`  ⚠️  Could not verify mint ${mint.slice(0, 8)}... - flagging as potential new mint`);
        this.knownMints.set(mint, { firstSeen: Date.now(), supply: '0' });
        tx.isNewMint = true;
        
        if (this.callbacks.onNewMint) {
          this.callbacks.onNewMint(walletAddress, mint, tx);
        }
      }
    }
  }

  async getWalletBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1e9;
    } catch (error) {
      return 0;
    }
  }

  async getTokenMetadata(mintAddress: string): Promise<{
    name: string;
    symbol: string;
    supply: string;
  } | null> {
    try {
      const publicKey = new PublicKey(mintAddress);
      const supply = await this.connection.getTokenSupply(publicKey);
      
      return {
        name: `Token ${mintAddress.slice(0, 6)}`,
        symbol: mintAddress.slice(0, 4).toUpperCase(),
        supply: supply.value.uiAmount?.toString() || '0',
      };
    } catch (error) {
      return null;
    }
  }

  getMonitoredWallets(): { address: string; nickname: string }[] {
    return Array.from(this.monitoredWallets.values()).map(w => ({
      address: w.address,
      nickname: w.nickname,
    }));
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping Solana Monitor V2...');
    
    for (const address of this.monitoredWallets.keys()) {
      await this.removeWallet(address);
    }
    
    console.log('✅ Solana Monitor V2 stopped');
  }
}

let monitorInstance: SolanaMonitorV2 | null = null;

export function getSolanaMonitor(): SolanaMonitorV2 {
  if (!monitorInstance) {
    monitorInstance = new SolanaMonitorV2();
  }
  return monitorInstance;
}
