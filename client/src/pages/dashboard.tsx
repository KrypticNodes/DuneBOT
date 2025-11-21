import { useState } from "react";
import { WalletCard } from "@/components/wallet-card";
import { StatCard } from "@/components/stat-card";
import { TransactionTable } from "@/components/transaction-table";
import { AlertPanel } from "@/components/alert-panel";
import { TokenDetailModal } from "@/components/token-detail-modal";
import { Wallet, Bell, Activity, Sparkles } from "lucide-react";
import type { WalletMonitor, Transaction, Alert, TokenMetadata } from "@shared/schema";

// todo: remove mock functionality
const mockWallets: WalletMonitor[] = [
  {
    id: '1',
    address: '127NpYRtkUAGsX4Fmy78Dg42LbQyghQHeAk5dvqxr86z',
    nickname: 'Sniper Alpha',
    balance: 23.45,
    lastActivity: '2 minutes ago',
    alertCount: 3,
    isActive: true,
    transactions: [],
  },
  {
    id: '2',
    address: '125VC2C5h73fwJcKJ3kSZH1Sn6c48BRbfcVJv8iPvFTw',
    nickname: 'Sniper Beta',
    balance: 18.92,
    lastActivity: '15 minutes ago',
    alertCount: 1,
    isActive: true,
    transactions: [],
  },
  {
    id: '3',
    address: '128yqBZYL1Ji78Kxxt4jpD1RDjbSEPW9atjarxUpGVSx',
    nickname: 'Sniper Gamma',
    balance: 31.27,
    lastActivity: '1 hour ago',
    alertCount: 0,
    isActive: true,
    transactions: [],
  },
  {
    id: '4',
    address: '12SFEfee5xLmTzbKBUPdayKhB8stizw4M3scqLiBjmds',
    nickname: 'Sniper Delta',
    balance: 12.56,
    lastActivity: '3 hours ago',
    alertCount: 0,
    isActive: false,
    transactions: [],
  },
  {
    id: '5',
    address: 'FijAGESwfkLEpRqyTbhqnFHq5Q7PQimB5Dh4baNVu6yD',
    nickname: 'Sniper Epsilon',
    balance: 45.78,
    lastActivity: '5 minutes ago',
    alertCount: 2,
    isActive: true,
    transactions: [],
  },
  {
    id: '6',
    address: '11CLpwZf1cFVBE9CxjfTVwHANDZqLizRzSihEKpwKV6',
    nickname: 'Sniper Zeta',
    balance: 8.34,
    lastActivity: '2 hours ago',
    alertCount: 0,
    isActive: true,
    transactions: [],
  },
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    signature: '5xJ9K2mL3nN4oP5qR6sT7uV8wX9yZ1aB2cD3eF4gH5iJ6',
    timestamp: '2 mins ago',
    type: 'mint',
    tokenMint: '7xKjP9mN3qR8sT4vW6yZ1aB2cD3eF4gH5iJ6kL7mN8oP',
    tokenName: 'PEPE2.0',
    amount: 1000000,
    sourceAddress: 'DRpbCBMxVnDK7mQGeKmEV4KdUbqfXrqbKbKJkTqzLmNp',
    destinationAddress: '127NpYRtkUAGsX4Fmy78Dg42LbQyghQHeAk5dvqxr86z',
    status: 'confirmed',
    isNewMint: true,
  },
  {
    id: '2',
    signature: '3aH8L9mM0nN1oP2qR3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2',
    timestamp: '15 mins ago',
    type: 'sell',
    tokenMint: '2yHjK8nM9qP7rS3tU5vW6xY1zB2aC3dE4fG5hI6jK7lM',
    tokenName: 'BONK',
    amount: 50000,
    sourceAddress: '127NpYRtkUAGsX4Fmy78Dg42LbQyghQHeAk5dvqxr86z',
    destinationAddress: 'DRpbCBMxVnDK7mQGeKmEV4KdUbqfXrqbKbKJkTqzLmNp',
    status: 'confirmed',
    isNewMint: false,
  },
  {
    id: '3',
    signature: '1bI7K8lL9mM0nN1oP2qR3sT4uV5wX6yZ7aB8cD9eF0gH',
    timestamp: '32 mins ago',
    type: 'transfer',
    tokenMint: '9zAjB0kC1lD2mE3nF4oG5pH6qI7rJ8sK9tL0mM1nN2oP',
    tokenName: 'SOL',
    amount: 15.5,
    sourceAddress: 'DRpbCBMxVnDK7mQGeKmEV4KdUbqfXrqbKbKJkTqzLmNp',
    destinationAddress: '125VC2C5h73fwJcKJ3kSZH1Sn6c48BRbfcVJv8iPvFTw',
    status: 'confirmed',
    isNewMint: false,
  },
  {
    id: '4',
    signature: '4cJ0K1lL2mM3nN4oP5qR6sT7uV8wX9yZ0aB1cD2eF3gH',
    timestamp: '1 hour ago',
    type: 'sell',
    tokenMint: '3xHiI9jJ0kK1lL2mM3nN4oO5pP6qQ7rR8sS9tT0uU1vV',
    tokenName: 'WIF',
    amount: 25000,
    sourceAddress: '128yqBZYL1Ji78Kxxt4jpD1RDjbSEPW9atjarxUpGVSx',
    destinationAddress: 'DRpbCBMxVnDK7mQGeKmEV4KdUbqfXrqbKbKJkTqzLmNp',
    status: 'confirmed',
    isNewMint: false,
  },
];

const mockAlerts: Alert[] = [
  {
    id: '1',
    timestamp: '1 min ago',
    type: 'new_mint',
    walletAddress: '127NpYRtkUAGsX4Fmy78Dg42LbQyghQHeAk5dvqxr86z',
    tokenMint: '7xKjP9mN3qR8sT4vW6yZ1aB2cD3eF4gH5iJ6kL7mN8oP',
    tokenName: 'PEPE2.0',
    message: 'New token mint detected in wallet',
    isRead: false,
  },
  {
    id: '2',
    timestamp: '5 mins ago',
    type: 'funding_detected',
    walletAddress: '125VC2C5h73fwJcKJ3kSZH1Sn6c48BRbfcVJv8iPvFTw',
    message: 'Funding wallet transferred 15 SOL to sniper wallet',
    isRead: false,
  },
  {
    id: '3',
    timestamp: '12 mins ago',
    type: 'unusual_activity',
    walletAddress: '128yqBZYL1Ji78Kxxt4jpD1RDjbSEPW9atjarxUpGVSx',
    message: 'High volume of transactions detected',
    isRead: true,
  },
  {
    id: '4',
    timestamp: '25 mins ago',
    type: 'new_mint',
    walletAddress: 'FijAGESwfkLEpRqyTbhqnFHq5Q7PQimB5Dh4baNVu6yD',
    tokenMint: '8yLkQ0oN1pP2qR3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kK',
    tokenName: 'DOGE2',
    message: 'New token mint detected in wallet',
    isRead: true,
  },
];

export default function Dashboard() {
  const [selectedToken, setSelectedToken] = useState<TokenMetadata | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const handleDismissAlert = (alertId: string) => {
    console.log('Dismiss alert:', alertId);
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const handleAlertClick = (alert: Alert) => {
    console.log('Alert clicked:', alert);
    if (alert.tokenMint && alert.tokenName) {
      // todo: remove mock functionality - fetch real token data
      const mockTokenData: TokenMetadata = {
        mint: alert.tokenMint,
        name: alert.tokenName,
        symbol: alert.tokenName.slice(0, 4).toUpperCase(),
        supply: '1000000000',
        holders: 1234,
        createdAt: 'Nov 21, 2025 10:30 AM UTC',
        firstDetectedAt: alert.timestamp,
        detectedInWallets: [alert.walletAddress],
      };
      setSelectedToken(mockTokenData);
      setIsTokenModalOpen(true);
    }
  };

  const handleViewWalletDetails = (wallet: WalletMonitor) => {
    console.log('View wallet details:', wallet);
  };

  const activeWallets = mockWallets.filter(w => w.isActive).length;
  const totalAlerts = alerts.filter(a => !a.isRead).length;
  const recentActivity = mockTransactions.filter(t => t.isNewMint).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="heading-dashboard">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Monitor sniper wallets and track new token mints in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monitored Wallets"
          value={mockWallets.length}
          description={`${activeWallets} active`}
          icon={Wallet}
        />
        <StatCard
          title="Active Alerts"
          value={totalAlerts}
          description="New alerts in last hour"
          icon={Bell}
        />
        <StatCard
          title="New Mints Today"
          value={recentActivity}
          description="Detected across all wallets"
          icon={Sparkles}
        />
        <StatCard
          title="Transaction Volume"
          value="247"
          description="Last 24 hours"
          icon={Activity}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {mockWallets.map((wallet) => (
          <WalletCard
            key={wallet.id}
            {...wallet}
            onViewDetails={() => handleViewWalletDetails(wallet)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-lg font-medium">Recent Transactions</h2>
            <p className="text-sm text-muted-foreground">
              Live feed of all wallet activity
            </p>
          </div>
          <TransactionTable transactions={mockTransactions} />
        </div>
        <div>
          <AlertPanel
            alerts={alerts}
            onDismiss={handleDismissAlert}
            onAlertClick={handleAlertClick}
          />
        </div>
      </div>

      <TokenDetailModal
        token={selectedToken}
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
      />
    </div>
  );
}
