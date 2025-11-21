import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold" data-testid="text-stat-value">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1" data-testid="text-stat-description">
            {description}
          </p>
        )}
        {trend && (
          <div className={`text-xs mt-2 ${trend.isPositive ? 'text-status-online' : 'text-status-busy'}`} data-testid="text-stat-trend">
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last hour
          </div>
        )}
      </CardContent>
    </Card>
  );
}
