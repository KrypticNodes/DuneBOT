import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Sparkles, TrendingUp, AlertTriangle, X } from "lucide-react";
import type { Alert } from "@shared/schema";

interface AlertPanelProps {
  alerts: Alert[];
  onDismiss: (alertId: string) => void;
  onAlertClick: (alert: Alert) => void;
}

export function AlertPanel({ alerts, onDismiss, onAlertClick }: AlertPanelProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'new_mint':
        return <Sparkles className="h-4 w-4" />;
      case 'funding_detected':
        return <TrendingUp className="h-4 w-4" />;
      case 'unusual_activity':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'new_mint':
        return 'destructive';
      case 'funding_detected':
        return 'default';
      case 'unusual_activity':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card data-testid="card-alert-panel">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-medium">Recent Alerts</CardTitle>
        <Badge variant="secondary" data-testid="badge-alert-count">
          {alerts.filter(a => !a.isRead).length} New
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-md border ${!alert.isRead ? 'bg-accent/50' : ''} hover-elevate cursor-pointer`}
                onClick={() => onAlertClick(alert)}
                data-testid={`alert-${alert.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Badge variant={getAlertVariant(alert.type)} className="mt-0.5">
                      {getAlertIcon(alert.type)}
                    </Badge>
                    <div className="flex-1 space-y-1">
                      {alert.tokenName && (
                        <p className="text-sm font-medium" data-testid="text-alert-token">
                          {alert.tokenName}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground" data-testid="text-alert-message">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span data-testid="text-alert-time">{alert.timestamp}</span>
                        <span>•</span>
                        <code className="font-mono">
                          {alert.walletAddress.slice(0, 8)}...
                        </code>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(alert.id);
                    }}
                    data-testid="button-dismiss-alert"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
