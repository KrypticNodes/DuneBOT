import { FundingWalletCard } from '../funding-wallet-card';

export default function FundingWalletCardExample() {
  return (
    <div className="p-6 bg-background">
      <div className="max-w-sm">
        <FundingWalletCard
          address="DRpbCBMxVnDK7mQGeKmEV4KdUbqfXrqbKbKJkTqzLmNpOrQsRsTuVwXyZ"
          confidence={87}
          totalFunded={245.67}
          lastFunding="3 hours ago"
          sniperWalletsCount={4}
          onViewDetails={() => console.log('View details clicked')}
        />
      </div>
    </div>
  );
}
