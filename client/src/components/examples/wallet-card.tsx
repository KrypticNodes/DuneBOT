import { WalletCard } from '../wallet-card';

export default function WalletCardExample() {
  return (
    <div className="p-6 bg-background">
      <div className="max-w-sm">
        <WalletCard
          address="127NpYRtkUAGsX4Fmy78Dg42LbQyghQHeAk5dvqxr86z"
          nickname="Sniper Alpha"
          balance={23.45}
          lastActivity="2 minutes ago"
          alertCount={3}
          isActive={true}
          onViewDetails={() => console.log('View details clicked')}
        />
      </div>
    </div>
  );
}
