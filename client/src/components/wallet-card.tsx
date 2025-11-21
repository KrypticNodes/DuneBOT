import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletCardProps {
  address: string;
  nickname: string;
  balance: number;
  lastActivity: string;
  alertCount: number;
  isActive: boolean;
  onViewDetails: () => void;
}

export function WalletCard({
  address,
  nickname,
  balance,
  lastActivity,
  alertCount,
  isActive,
  onViewDetails,
}: WalletCardProps) {
  const { toast } = useToast();

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast({
      description: "Address copied to clipboard",
    });
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="hover-elevate" data-testid={`wallet-card-${address}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{nickname}</CardTitle>
        {alertCount > 0 && (
          <Badge variant="destructive" className="h-5 px-2" data-testid="badge-alert-count">
            {alertCount}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono text-muted-foreground" data-testid="text-wallet-address">
            {truncateAddress(address)}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={copyAddress}
            data-testid="button-copy-address"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            data-testid="button-view-explorer"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-sm font-medium" data-testid="text-balance">{balance.toFixed(2)} SOL</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-status-online' : 'bg-status-offline'}`}></div>
              <p className="text-sm font-medium" data-testid="text-status">{isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Last Activity</p>
          <p className="text-sm font-medium" data-testid="text-last-activity">{lastActivity}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onViewDetails}
          data-testid="button-view-details"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
