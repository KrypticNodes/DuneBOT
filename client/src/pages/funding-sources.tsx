import { FundingWalletCard } from "@/components/funding-wallet-card";
import type { FundingWallet } from "@shared/schema";

// todo: remove mock functionality
const mockFundingWallets: FundingWallet[] = [
  {
    id: '1',
    address: 'DRpbCBMxVnDK7mQGeKmEV4KdUbqfXrqbKbKJkTqzLmNpOrQsRsTuVwXyZ',
    confidence: 87,
    totalFunded: 245.67,
    lastFunding: '3 hours ago',
    sniperWalletsCount: 4,
    recentTransactions: [],
  },
  {
    id: '2',
    address: 'ErQcSBNxVoDL8nRHfLjVmFnKpMsUwXzYaC1dE2fG3hI4jK5lM6nN7oP8qR',
    confidence: 72,
    totalFunded: 178.23,
    lastFunding: '1 day ago',
    sniperWalletsCount: 3,
    recentTransactions: [],
  },
  {
    id: '3',
    address: 'FrRdTCOyWpEM9oSIgMkVnXo0qYb1cZ2dA3eB4fC5gD6hE7iF8jG9kH0lI',
    confidence: 94,
    totalFunded: 512.89,
    lastFunding: '1 hour ago',
    sniperWalletsCount: 5,
    recentTransactions: [],
  },
  {
    id: '4',
    address: 'GsSeTDPzXqFN0pTJhNlWoYr1qZc2dB3eA4fD5gC6hF7iE8jH9kG0lJ1mI',
    confidence: 65,
    totalFunded: 89.45,
    lastFunding: '2 days ago',
    sniperWalletsCount: 2,
    recentTransactions: [],
  },
];

export default function FundingSources() {
  const handleViewDetails = (wallet: FundingWallet) => {
    console.log('View funding wallet details:', wallet);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="heading-funding-sources">Funding Sources</h1>
        <p className="text-sm text-muted-foreground">
          Backtracked wallets that fund sniper operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockFundingWallets.map((wallet) => (
          <FundingWalletCard
            key={wallet.id}
            {...wallet}
            onViewDetails={() => handleViewDetails(wallet)}
          />
        ))}
      </div>
    </div>
  );
}
