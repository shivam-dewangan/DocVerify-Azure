import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'accent' | 'success' | 'warning';
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  variant = 'default' 
}: StatsCardProps) {
  return (
    <Card className={cn(
      'p-6 transition-all hover:shadow-md',
      variant === 'accent' && 'border-accent/20 bg-accent/5',
      variant === 'success' && 'border-success/20 bg-success/5',
      variant === 'warning' && 'border-warning/20 bg-warning/5'
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {trend && (
            <p className={cn(
              'text-xs font-medium mt-2',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={cn(
          'rounded-lg p-3',
          variant === 'default' && 'bg-muted',
          variant === 'accent' && 'bg-accent/10',
          variant === 'success' && 'bg-success/10',
          variant === 'warning' && 'bg-warning/10'
        )}>
          <Icon className={cn(
            'w-5 h-5',
            variant === 'default' && 'text-muted-foreground',
            variant === 'accent' && 'text-accent',
            variant === 'success' && 'text-success',
            variant === 'warning' && 'text-warning'
          )} />
        </div>
      </div>
    </Card>
  );
}
