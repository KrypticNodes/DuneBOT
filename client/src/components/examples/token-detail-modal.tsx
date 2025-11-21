import { useState } from 'react';
import { TokenDetailModal } from '../token-detail-modal';
import { Button } from '@/components/ui/button';
import type { TokenMetadata } from '@shared/schema';

const mockToken: TokenMetadata = {
  mint: '7xKjP9mN3qR8sT4vW6yZ1aB2cD3eF4gH5iJ6kL7mN8oPqRsT',
  name: 'PEPE 2.0',
  symbol: 'PEPE2',
  supply: '1000000000',
  holders: 1234,
  createdAt: 'Nov 21, 2025 10:30 AM UTC',
  firstDetectedAt: '2 minutes ago',
  detectedInWallets: [
    '127NpYRtkUAGsX4Fmy78Dg42LbQyghQHeAk5dvqxr86z',
    '125VC2C5h73fwJcKJ3kSZH1Sn6c48BRbfcVJv8iPvFTw',
  ],
};

export default function TokenDetailModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-6 bg-background">
      <Button onClick={() => setIsOpen(true)}>Open Token Details</Button>
      <TokenDetailModal
        token={mockToken}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
