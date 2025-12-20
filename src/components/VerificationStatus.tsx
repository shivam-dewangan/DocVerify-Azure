import { CheckCircle2, Clock, XCircle, Shield } from 'lucide-react';
import { VerificationStatus as Status } from '@/types/document';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VerificationStatusProps {
  status: Status;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  verified: {
    icon: CheckCircle2,
    label: 'Verified',
    variant: 'success' as const,
    description: 'Document integrity confirmed',
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    variant: 'warning' as const,
    description: 'Awaiting verification',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    variant: 'destructive' as const,
    description: 'Integrity check failed',
  },
};

export function VerificationStatus({ status, showIcon = true, size = 'md' }: VerificationStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'gap-1.5 font-medium transition-all',
        sizeClasses[size],
        status === 'verified' && 'animate-check'
      )}
    >
      {showIcon && <Icon size={iconSizes[size]} className="shrink-0" />}
      {config.label}
    </Badge>
  );
}

interface VerificationCardProps {
  status: Status;
  hash: string;
  verifiedAt?: Date;
}

export function VerificationCard({ status, hash, verifiedAt }: VerificationCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn(
      'rounded-lg border p-4 transition-all',
      status === 'verified' && 'border-success/30 bg-success/5',
      status === 'pending' && 'border-warning/30 bg-warning/5',
      status === 'failed' && 'border-destructive/30 bg-destructive/5'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'rounded-full p-2',
          status === 'verified' && 'bg-success/10 text-success',
          status === 'pending' && 'bg-warning/10 text-warning',
          status === 'failed' && 'bg-destructive/10 text-destructive'
        )}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground">{config.label}</span>
            <Shield size={14} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">{config.description}</p>
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                SHA-256 Hash
              </span>
              <p className="hash-display mt-1">{hash}</p>
            </div>
            {verifiedAt && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Verified At
                </span>
                <p className="text-sm text-foreground mt-1">
                  {verifiedAt.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
