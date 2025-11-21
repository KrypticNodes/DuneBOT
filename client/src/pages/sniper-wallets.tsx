import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TransactionTable } from "@/components/transaction-table";
import { Search } from "lucide-react";
import type { WalletMonitor, Transaction } from "@shared/schema";

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
];

export default function SniperWallets() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<WalletMonitor | null>(mockWallets[0]);

  const filteredWallets = mockWallets.filter(wallet =>
    wallet.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wallet.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="heading-sniper-wallets">Sniper Wallets</h1>
        <p className="text-sm text-muted-foreground">
          Monitor and analyze sniper wallet activity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tracked Wallets</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search wallets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-wallets"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  onClick={() => setSelectedWallet(wallet)}
                  className={`p-3 rounded-md border cursor-pointer hover-elevate ${
                    selectedWallet?.id === wallet.id ? 'bg-accent' : ''
                  }`}
                  data-testid={`wallet-item-${wallet.id}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{wallet.nickname}</p>
                    <div className={`h-2 w-2 rounded-full ${wallet.isActive ? 'bg-status-online' : 'bg-status-offline'}`}></div>
                  </div>
                  <code className="text-xs text-muted-foreground font-mono">
                    {wallet.address.slice(0, 8)}...
                  </code>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {selectedWallet ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedWallet.nickname}</CardTitle>
                  <code className="text-sm text-muted-foreground font-mono" data-testid="text-selected-wallet-address">
                    {selectedWallet.address}
                  </code>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="text-xl font-semibold" data-testid="text-wallet-balance">
                        {selectedWallet.balance.toFixed(2)} SOL
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Activity</p>
                      <p className="text-xl font-semibold" data-testid="text-wallet-last-activity">
                        {selectedWallet.lastActivity}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${selectedWallet.isActive ? 'bg-status-online' : 'bg-status-offline'}`}></div>
                        <p className="text-xl font-semibold" data-testid="text-wallet-status">
                          {selectedWallet.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h2 className="text-lg font-medium mb-4">Transaction History</h2>
                <TransactionTable transactions={mockTransactions} />
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Select a wallet to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
