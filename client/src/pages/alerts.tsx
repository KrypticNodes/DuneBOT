import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, TrendingUp, AlertTriangle, X, Search } from "lucide-react";
import type { Alert } from "@shared/schema";

// todo: remove mock functionality
const initialAlerts: Alert[] = [
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
  {
    id: '4',
    timestamp: '25 mins ago',
    type: 'new_mint',
    walletAddress: 'FijAGESwfkLEpRqyTbhqnFHq5Q7PQimB5Dh4baNVu6yD',
    tokenMint: '8yLkQ0oN1pP2qR3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kK',
    tokenName: 'DOGE2',
    message: 'New token mint detected in wallet',
    isRead: true,
  },
  {
    id: '5',
    timestamp: '45 mins ago',
    type: 'funding_detected',
    walletAddress: '11CLpwZf1cFVBE9CxjfTVwHANDZqLizRzSihEKpwKV6',
    message: 'New funding source identified with 92% confidence',
    isRead: true,
  },
  {
    id: '6',
    timestamp: '1 hour ago',
    type: 'new_mint',
    walletAddress: '127NpYRtkUAGsX4Fmy78Dg42LbQyghQHeAk5dvqxr86z',
    tokenMint: '3xHiI9jJ0kK1lL2mM3nN4oO5pP6qQ7rR8sS9tT0uU1vV',
    tokenName: 'SHIB3',
    message: 'New token mint detected in wallet',
    isRead: true,
  },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'new_mint':
        return <Sparkles className="h-4 w-4" />;
      case 'funding_detected':
        return <TrendingUp className="h-4 w-4" />;
      case 'unusual_activity':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
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

  const dismissAlert = (alertId: string) => {
    console.log('Dismiss alert:', alertId);
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const markAsRead = (alertId: string) => {
    console.log('Mark as read:', alertId);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = filterType === "all" || alert.type === filterType;
    const matchesSearch = alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (alert.tokenName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="heading-alerts">Alerts</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread {unreadCount === 1 ? 'alert' : 'alerts'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter Alerts</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-alerts"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger data-testid="select-alert-type">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="new_mint">New Mints</SelectItem>
                <SelectItem value="funding_detected">Funding Detected</SelectItem>
                <SelectItem value="unusual_activity">Unusual Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card
            key={alert.id}
            className={`${!alert.isRead ? 'border-primary' : ''} hover-elevate`}
            data-testid={`alert-card-${alert.id}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <Badge variant={getAlertVariant(alert.type)}>
                    {getAlertIcon(alert.type)}
                  </Badge>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {alert.tokenName && (
                        <p className="text-base font-medium" data-testid="text-alert-token">
                          {alert.tokenName}
                        </p>
                      )}
                      {!alert.isRead && (
                        <Badge variant="secondary" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground" data-testid="text-alert-message">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span data-testid="text-alert-time">{alert.timestamp}</span>
                      <span>•</span>
                      <code className="font-mono">
                        {alert.walletAddress.slice(0, 12)}...
                      </code>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!alert.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(alert.id)}
                      data-testid="button-mark-read"
                    >
                      Mark Read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dismissAlert(alert.id)}
                    data-testid="button-dismiss"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAlerts.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No alerts found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
