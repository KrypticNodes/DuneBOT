import { TransactionTable } from '../transaction-table';
import type { Transaction } from '@shared/schema';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    signature: '5xJ9K...',
    timestamp: '2 mins ago',
    type: 'mint',
    tokenMint: '7xKjP9mN3qR8sT4vW6yZ1aB2cD3eF4gH5iJ6kL7mN8oP',
    tokenName: 'PEPE2.0',
    amount: 1000000,
    sourceAddress: 'DRpbCBMxVnDK7mQGeKmEV4KdU...',
    destinationAddress: '127NpYRtkUAGsX4Fmy78Dg42LbQyghQHeAk5dvqxr86z',
    status: 'confirmed',
    isNewMint: true,
  },
  {
    id: '2',
    signature: '3aH8L...',
    timestamp: '15 mins ago',
    type: 'sell',
    tokenMint: '2yHjK8nM9qP7rS3tU5vW6xY1zB2aC3dE4fG5hI6jK7lM',
    tokenName: 'BONK',
    amount: 50000,
    sourceAddress: '127NpYRtkUAGsX4Fmy78Dg42LbQyghQHeAk5dvqxr86z',
    destinationAddress: 'DRpbCBMxVnDK7mQGeKmEV4KdU...',
    status: 'confirmed',
    isNewMint: false,
  },
];

export default function TransactionTableExample() {
  return (
    <div className="p-6 bg-background">
      <TransactionTable transactions={mockTransactions} />
    </div>
  );
}
