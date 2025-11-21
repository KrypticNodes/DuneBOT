import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TokenMetadata } from "@shared/schema";

interface TokenDetailModalProps {
  token: TokenMetadata | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TokenDetailModal({ token, isOpen, onClose }: TokenDetailModalProps) {
  const { toast } = useToast();

  if (!token) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="modal-token-detail">
        <DialogHeader>
          <DialogTitle className="text-xl">{token.name} ({token.symbol})</DialogTitle>
          <DialogDescription>Token Details and Metadata</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Mint Address</p>
            <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
              <code className="text-xs font-mono flex-1" data-testid="text-mint-address">
                {token.mint}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(token.mint)}
                data-testid="button-copy-mint"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                data-testid="button-view-mint-explorer"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Supply</p>
              <p className="text-lg font-semibold" data-testid="text-supply">
                {parseInt(token.supply).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Holders</p>
              <p className="text-lg font-semibold" data-testid="text-holders">
                {token.holders.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Created At</p>
              <p className="text-sm" data-testid="text-created-at">{token.createdAt}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">First Detected</p>
              <p className="text-sm" data-testid="text-first-detected">{token.firstDetectedAt}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Detected In Wallets ({token.detectedInWallets.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {token.detectedInWallets.map((wallet, idx) => (
                <Badge key={idx} variant="outline" className="font-mono text-xs" data-testid={`badge-wallet-${idx}`}>
                  {wallet.slice(0, 8)}...
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" data-testid="button-view-explorer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Solscan
            </Button>
            <Button variant="outline" onClick={onClose} data-testid="button-close">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
