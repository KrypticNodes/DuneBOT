import { StatCard } from '../stat-card';
import { Wallet } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="p-6 bg-background">
      <div className="max-w-xs">
        <StatCard
          title="Active Wallets"
          value={6}
          description="Monitoring 6 sniper wallets"
          icon={Wallet}
          trend={{ value: 12, isPositive: true }}
        />
      </div>
    </div>
  );
}
