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
      'p-3 sm:p-4 transition-all hover:shadow-lg hover:scale-105 duration-300 neon-card h-24 sm:h-28',
      variant === 'accent' && 'border-accent/30 bg-accent/5',
      variant === 'success' && 'border-success/30 bg-success/5',
      variant === 'warning' && 'border-warning/30 bg-warning/5'
    )}>
      <div className="flex items-start justify-between h-full">
        <div className="min-w-0 flex-1 flex flex-col justify-between">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground animate-scale-in">{value}</p>
          {trend && (
            <p className={cn(
              'text-xs font-medium animate-slide-in',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={cn(
          'rounded-lg p-2 animate-float shrink-0',
          variant === 'default' && 'bg-muted',
          variant === 'accent' && 'bg-accent/20 shadow-glow',
          variant === 'success' && 'bg-success/20 shadow-glow',
          variant === 'warning' && 'bg-warning/20 shadow-glow'
        )}>
          <Icon className={cn(
            'w-4 h-4',
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
