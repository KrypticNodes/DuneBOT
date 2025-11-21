import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getSolanaMonitor } from "./solana-monitor";
import { AppWebSocketServer } from "./websocket-server";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  const wsServer = new AppWebSocketServer(httpServer);
  
  // Initialize Solana monitor
  const monitor = getSolanaMonitor();
  
  // Set up callbacks for blockchain events
  monitor.setCallbacks({
    onTransaction: (walletAddress, tx) => {
      console.log(`📊 Transaction detected for ${walletAddress.slice(0, 8)}...`);
      
      // Broadcast to connected clients
      wsServer.broadcast({
        type: 'transaction',
        data: {
          walletAddress,
          transaction: tx,
          timestamp: new Date().toISOString(),
        },
      });

      // Store in memory for recent activity
      storage.addTransaction({
        id: tx.signature,
        ...tx,
        status: 'confirmed',
      });
    },
    onNewMint: (walletAddress, mint) => {
      console.log(`🆕 NEW MINT ALERT: ${mint.slice(0, 8)}... in wallet ${walletAddress.slice(0, 8)}...`);
      
      // Create alert
      const alert = storage.createAlert({
        type: 'new_mint',
        walletAddress,
        tokenMint: mint,
        message: `New token mint detected in wallet ${walletAddress.slice(0, 8)}...`,
      });

      // Broadcast to connected clients
      wsServer.broadcast({
        type: 'new_mint',
        data: {
          walletAddress,
          mint,
          alert,
          timestamp: new Date().toISOString(),
        },
      });

      wsServer.broadcast({
        type: 'alert',
        data: alert,
      });
    },
    onError: (error) => {
      console.error('❌ Solana Monitor Error:', error);
    },
  });

  // Start monitoring the predefined sniper wallets
  const sniperWallets = [
    { address: '127NpYRtkUAGsX4Fmy78Dg42LbQyghQHeAk5dvqxr86z', nickname: 'Sniper Alpha' },
    { address: '125VC2C5h73fwJcKJ3kSZH1Sn6c48BRbfcVJv8iPvFTw', nickname: 'Sniper Beta' },
    { address: '128yqBZYL1Ji78Kxxt4jpD1RDjbSEPW9atjarxUpGVSx', nickname: 'Sniper Gamma' },
    { address: '12SFEfee5xLmTzbKBUPdayKhB8stizw4M3scqLiBjmds', nickname: 'Sniper Delta' },
    { address: 'FijAGESwfkLEpRqyTbhqnFHq5Q7PQimB5Dh4baNVu6yD', nickname: 'Sniper Epsilon' },
    { address: '11CLpwZf1cFVBE9CxjfTVwHANDZqLizRzSihEKpwKV6', nickname: 'Sniper Zeta' },
  ];

  // Add wallets with slight delay to avoid overwhelming the RPC
  for (const wallet of sniperWallets) {
    await monitor.addWallet(wallet.address, wallet.nickname);
    await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between wallet subscriptions
  }

  // API Routes
  
  // Get all monitored wallets with current data
  app.get('/api/wallets', async (req, res) => {
    try {
      const wallets = monitor.getMonitoredWallets();
      const walletsWithData = await Promise.all(
        wallets.map(async (wallet) => {
          const balance = await monitor.getWalletBalance(wallet.address);
          const transactions = storage.getTransactionsByWallet(wallet.address);
          const alerts = storage.getAlertsByWallet(wallet.address);
          
          return {
            id: wallet.address,
            address: wallet.address,
            nickname: wallet.nickname,
            balance,
            lastActivity: transactions[0]?.timestamp || 'No activity',
            alertCount: alerts.filter(a => !a.isRead).length,
            isActive: true,
            transactions: transactions.slice(0, 10),
          };
        })
      );
      
      res.json(walletsWithData);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      res.status(500).json({ error: 'Failed to fetch wallets' });
    }
  });

  // Get transactions for a specific wallet
  app.get('/api/wallets/:address/transactions', (req, res) => {
    try {
      const { address } = req.params;
      const transactions = storage.getTransactionsByWallet(address);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  // Get all recent transactions
  app.get('/api/transactions', (req, res) => {
    try {
      const transactions = storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  // Get all alerts
  app.get('/api/alerts', (req, res) => {
    try {
      const alerts = storage.getAllAlerts();
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  // Mark alert as read
  app.post('/api/alerts/:id/read', (req, res) => {
    try {
      const { id } = req.params;
      storage.markAlertAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking alert as read:', error);
      res.status(500).json({ error: 'Failed to mark alert as read' });
    }
  });

  // Dismiss alert
  app.delete('/api/alerts/:id', (req, res) => {
    try {
      const { id } = req.params;
      storage.deleteAlert(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting alert:', error);
      res.status(500).json({ error: 'Failed to delete alert' });
    }
  });

  // Get token metadata
  app.get('/api/tokens/:mint', async (req, res) => {
    try {
      const { mint } = req.params;
      const metadata = await monitor.getTokenMetadata(mint);
      
      if (!metadata) {
        return res.status(404).json({ error: 'Token not found' });
      }
      
      res.json(metadata);
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      res.status(500).json({ error: 'Failed to fetch token metadata' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      wsClients: wsServer.getClientCount(),
      monitoredWallets: monitor.getMonitoredWallets().length,
      timestamp: new Date().toISOString(),
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    await monitor.stop();
    wsServer.close();
    process.exit(0);
  });

  return httpServer;
}
