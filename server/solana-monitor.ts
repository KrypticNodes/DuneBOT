import { Connection, PublicKey, ParsedTransactionWithMeta, GetVersionedTransactionConfig } from '@solana/web3.js';
import WebSocket from 'ws';

interface MonitoredWallet {
  address: string;
  nickname: string;
  subscriptionId?: number;
}

interface TokenTransfer {
  mint: string;
  amount: number;
  fromAddress: string;
  toAddress: string;
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
}

export class SolanaMonitor {
  private connection: Connection;
  private wsConnection: Connection;
  private heliusApiKey: string;
  private knownMints: Set<string> = new Set();
  private monitoredWallets: Map<string, MonitoredWallet> = new Map();
  private subscriptions: Map<string, number> = new Map();
  private callbacks: {
    onTransaction?: (walletAddress: string, tx: ParsedTransaction) => void;
    onNewMint?: (walletAddress: string, mint: string) => void;
    onError?: (error: Error) => void;
  } = {};

  constructor() {
    this.heliusApiKey = process.env.HELIUS_API_KEY || '';
    
    // Use Helius for HTTP RPC calls (better rate limits on free tier)
    const heliusUrl = this.heliusApiKey 
      ? `https://mainnet.helius-rpc.com/?api-key=${this.heliusApiKey}`
      : 'https://api.mainnet-beta.solana.com';
    
    this.connection = new Connection(heliusUrl, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    });

    // Use public WebSocket endpoint for real-time subscriptions
    this.wsConnection = new Connection('https://api.mainnet-beta.solana.com', {
      commitment: 'confirmed',
      wsEndpoint: 'wss://api.mainnet-beta.solana.com',
    });

    console.log('✅ Solana Monitor initialized');
    console.log(`📡 HTTP RPC: ${this.heliusApiKey ? 'Helius' : 'Public'}`);
    console.log(`🔌 WebSocket: Public endpoint`);
  }

  setCallbacks(callbacks: {
    onTransaction?: (walletAddress: string, tx: ParsedTransaction) => void;
    onNewMint?: (walletAddress: string, mint: string) => void;
    onError?: (error: Error) => void;
  }) {
    this.callbacks = callbacks;
  }

  async addWallet(address: string, nickname: string): Promise<void> {
    if (this.monitoredWallets.has(address)) {
      console.log(`⚠️  Wallet ${nickname} already being monitored`);
      return;
    }

    try {
      const publicKey = new PublicKey(address);
      
      // Subscribe to account changes (for balance updates)
      const accountSubId = this.wsConnection.onAccountChange(
        publicKey,
        async (accountInfo, context) => {
          console.log(`💰 Balance change for ${nickname} at slot ${context.slot}`);
          // Fetch recent transactions to analyze the change
          await this.fetchRecentTransactions(address);
        },
        'confirmed'
      );

      // Subscribe to transaction logs (more reliable for catching all activity)
      const logsSubId = this.wsConnection.onLogs(
        publicKey,
        async (logs) => {
          if (logs.err) {
            console.log(`❌ Failed transaction for ${nickname}: ${logs.signature}`);
            return;
          }
          
          console.log(`📝 New transaction for ${nickname}: ${logs.signature}`);
          await this.processTransaction(address, logs.signature);
        },
        'confirmed'
      );

      this.monitoredWallets.set(address, { address, nickname, subscriptionId: logsSubId });
      this.subscriptions.set(`${address}-account`, accountSubId);
      this.subscriptions.set(`${address}-logs`, logsSubId);

      console.log(`✅ Started monitoring ${nickname} (${address.slice(0, 8)}...)`);

      // Fetch initial transaction history
      await this.fetchRecentTransactions(address);
    } catch (error) {
      console.error(`❌ Failed to add wallet ${nickname}:`, error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error as Error);
      }
    }
  }

  async removeWallet(address: string): Promise<void> {
    const accountSubId = this.subscriptions.get(`${address}-account`);
    const logsSubId = this.subscriptions.get(`${address}-logs`);

    if (accountSubId !== undefined) {
      await this.wsConnection.removeAccountChangeListener(accountSubId);
      this.subscriptions.delete(`${address}-account`);
    }

    if (logsSubId !== undefined) {
      await this.wsConnection.removeOnLogsListener(logsSubId);
      this.subscriptions.delete(`${address}-logs`);
    }

    this.monitoredWallets.delete(address);
    console.log(`🛑 Stopped monitoring ${address.slice(0, 8)}...`);
  }

  private async fetchRecentTransactions(address: string): Promise<void> {
    try {
      const publicKey = new PublicKey(address);
      const signatures = await this.connection.getSignaturesForAddress(publicKey, {
        limit: 10,
      });

      for (const sigInfo of signatures) {
        await this.processTransaction(address, sigInfo.signature);
      }
    } catch (error) {
      console.error(`Error fetching recent transactions for ${address}:`, error);
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

      const parsedTx = this.parseTransaction(walletAddress, signature, tx);
      
      if (parsedTx) {
        // Check if this is a new mint
        if (parsedTx.isNewMint && !this.knownMints.has(parsedTx.tokenMint)) {
          this.knownMints.add(parsedTx.tokenMint);
          console.log(`🆕 NEW MINT DETECTED: ${parsedTx.tokenName} (${parsedTx.tokenMint.slice(0, 8)}...)`);
          
          if (this.callbacks.onNewMint) {
            this.callbacks.onNewMint(walletAddress, parsedTx.tokenMint);
          }
        }

        if (this.callbacks.onTransaction) {
          this.callbacks.onTransaction(walletAddress, parsedTx);
        }
      }
    } catch (error) {
      console.error(`Error processing transaction ${signature}:`, error);
    }
  }

  private parseTransaction(
    walletAddress: string,
    signature: string,
    tx: ParsedTransactionWithMeta
  ): ParsedTransaction | null {
    if (!tx.meta || !tx.blockTime) {
      return null;
    }

    const walletPubkey = new PublicKey(walletAddress);
    
    // Analyze pre and post token balances to detect transfers
    const preBalances = tx.meta.preTokenBalances || [];
    const postBalances = tx.meta.postTokenBalances || [];
    
    // Find token balance changes for this wallet
    for (let i = 0; i < postBalances.length; i++) {
      const postBalance = postBalances[i];
      const preBalance = preBalances.find(
        (pre) => pre.accountIndex === postBalance.accountIndex
      );

      if (!postBalance.uiTokenAmount || !postBalance.mint) {
        continue;
      }

      const postAmount = postBalance.uiTokenAmount.uiAmount || 0;
      const preAmount = preBalance?.uiTokenAmount?.uiAmount || 0;
      const change = postAmount - preAmount;

      if (Math.abs(change) < 0.000001) {
        continue; // Ignore negligible changes
      }

      // Determine transaction type
      let type: 'buy' | 'sell' | 'transfer' | 'mint';
      let sourceAddress = '';
      let destinationAddress = '';

      if (!preBalance || preAmount === 0) {
        // New token appeared in wallet
        type = 'mint';
        sourceAddress = 'Unknown';
        destinationAddress = walletAddress;
      } else if (change > 0) {
        // Token amount increased (buy or receive)
        type = 'buy';
        sourceAddress = 'DEX/Transfer';
        destinationAddress = walletAddress;
      } else {
        // Token amount decreased (sell or send)
        type = 'sell';
        sourceAddress = walletAddress;
        destinationAddress = 'DEX/Transfer';
      }

      // Check if this mint is new (not in our known mints set)
      const isNewMint = !this.knownMints.has(postBalance.mint);

      return {
        signature,
        timestamp: new Date(tx.blockTime * 1000).toISOString(),
        type,
        tokenMint: postBalance.mint,
        tokenName: postBalance.mint.slice(0, 6), // We'll enhance this with metadata later
        amount: Math.abs(change),
        sourceAddress,
        destinationAddress,
        isNewMint,
      };
    }

    return null;
  }

  async getWalletBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error(`Error getting balance for ${address}:`, error);
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
      console.error(`Error getting token metadata for ${mintAddress}:`, error);
      return null;
    }
  }

  getMonitoredWallets(): MonitoredWallet[] {
    return Array.from(this.monitoredWallets.values());
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping Solana Monitor...');
    
    for (const address of this.monitoredWallets.keys()) {
      await this.removeWallet(address);
    }
    
    console.log('✅ Solana Monitor stopped');
  }
}

// Singleton instance
let monitorInstance: SolanaMonitor | null = null;

export function getSolanaMonitor(): SolanaMonitor {
  if (!monitorInstance) {
    monitorInstance = new SolanaMonitor();
  }
  return monitorInstance;
}
