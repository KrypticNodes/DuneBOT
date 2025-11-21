import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Transaction } from "@shared/schema";

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Copied to clipboard",
    });
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'buy':
        return 'default';
      case 'sell':
        return 'secondary';
      case 'transfer':
        return 'outline';
      case 'mint':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Token</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id} className="hover-elevate" data-testid={`transaction-row-${tx.id}`}>
              <TableCell className="text-xs" data-testid="text-timestamp">{tx.timestamp}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Badge variant={getTypeBadgeVariant(tx.type)} className="capitalize" data-testid="badge-tx-type">
                    {tx.type}
                  </Badge>
                  {tx.isNewMint && (
                    <Badge variant="destructive" data-testid="badge-new-mint">New</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm font-medium" data-testid="text-token-name">{tx.tokenName}</p>
                  <code className="text-xs text-muted-foreground font-mono">
                    {truncateAddress(tx.tokenMint)}
                  </code>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono text-sm" data-testid="text-amount">
                {tx.amount.toLocaleString()}
              </TableCell>
              <TableCell>
                <code className="text-xs font-mono text-muted-foreground">
                  {truncateAddress(tx.sourceAddress)}
                </code>
              </TableCell>
              <TableCell>
                <code className="text-xs font-mono text-muted-foreground">
                  {truncateAddress(tx.destinationAddress)}
                </code>
              </TableCell>
              <TableCell>
                <Badge
                  variant={tx.status === 'confirmed' ? 'default' : 'outline'}
                  className="capitalize"
                  data-testid="badge-status"
                >
                  {tx.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(tx.signature)}
                    data-testid="button-copy-signature"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    data-testid="button-view-tx"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
