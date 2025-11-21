import { AlertPanel } from '../alert-panel';
import type { Alert } from '@shared/schema';

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
];

export default function AlertPanelExample() {
  return (
    <div className="p-6 bg-background">
      <div className="max-w-md">
        <AlertPanel
          alerts={mockAlerts}
          onDismiss={(id) => console.log('Dismiss alert:', id)}
          onAlertClick={(alert) => console.log('Alert clicked:', alert)}
        />
      </div>
    </div>
  );
}
