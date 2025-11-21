import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Copy, ExternalLink, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FundingWalletCardProps {
  address: string;
  confidence: number;
  totalFunded: number;
  lastFunding: string;
  sniperWalletsCount: number;
  onViewDetails: () => void;
}

export function FundingWalletCard({
  address,
  confidence,
  totalFunded,
  lastFunding,
  sniperWalletsCount,
  onViewDetails,
}: FundingWalletCardProps) {
  const { toast } = useToast();

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast({
      description: "Address copied to clipboard",
    });
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'text-status-online';
    if (conf >= 50) return 'text-status-away';
    return 'text-status-busy';
  };

  return (
    <Card className="hover-elevate" data-testid={`funding-wallet-card-${address}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-medium">Funding Source</CardTitle>
        </div>
        <Badge variant="default" data-testid="badge-confidence">
          {confidence}% Match
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-foreground" data-testid="text-funding-address">
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
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Confidence Level</p>
          <Progress value={confidence} className="h-2" />
          <p className={`text-xs font-medium mt-1 ${getConfidenceColor(confidence)}`}>
            {confidence >= 80 ? 'High' : confidence >= 50 ? 'Medium' : 'Low'} Confidence
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Funded</p>
            <p className="text-sm font-medium" data-testid="text-total-funded">
              {totalFunded.toFixed(2)} SOL
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Linked Wallets</p>
            <p className="text-sm font-medium" data-testid="text-sniper-count">
              {sniperWalletsCount}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Last Funding</p>
          <p className="text-sm font-medium" data-testid="text-last-funding">{lastFunding}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onViewDetails}
          data-testid="button-view-details"
        >
          View Transaction History
        </Button>
      </CardContent>
    </Card>
  );
}
