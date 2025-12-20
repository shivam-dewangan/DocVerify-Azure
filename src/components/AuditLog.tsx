import { useState } from 'react';
import { 
  Upload, 
  CheckCircle2, 
  Download, 
  Trash2, 
  Hash, 
  ShieldCheck,
  Filter,
  Search,
  User,
  Globe
} from 'lucide-react';
import { AuditLogEntry } from '@/types/document';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface AuditLogProps {
  entries: AuditLogEntry[];
}

const actionConfig = {
  upload: {
    icon: Upload,
    label: 'Upload',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  verify: {
    icon: CheckCircle2,
    label: 'Verify',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  download: {
    icon: Download,
    label: 'Download',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  delete: {
    icon: Trash2,
    label: 'Delete',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  hash_generated: {
    icon: Hash,
    label: 'Hash Generated',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  integrity_check: {
    icon: ShieldCheck,
    label: 'Integrity Check',
    color: 'text-success',
    bg: 'bg-success/10',
  },
};

export function AuditLog({ entries }: AuditLogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.details?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || entry.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="upload">Upload</SelectItem>
            <SelectItem value="verify">Verify</SelectItem>
            <SelectItem value="download">Download</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="hash_generated">Hash Generated</SelectItem>
            <SelectItem value="integrity_check">Integrity Check</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredEntries.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="rounded-full bg-muted w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No logs found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-px bg-border" />

          <div className="space-y-1">
            {filteredEntries.map((entry, index) => {
              const config = actionConfig[entry.action];
              const Icon = config.icon;

              return (
                <div
                  key={entry.id}
                  className={cn(
                    'relative pl-14 pr-4 py-3 animate-slide-in',
                    'hover:bg-muted/50 rounded-lg transition-colors'
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* Timeline dot */}
                  <div className={cn(
                    'absolute left-3 top-4 w-5 h-5 rounded-full flex items-center justify-center z-10',
                    config.bg
                  )}>
                    <Icon className={cn('w-3 h-3', config.color)} />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {config.label}
                        </Badge>
                        <span className="text-sm font-medium text-foreground truncate">
                          {entry.documentName}
                        </span>
                      </div>
                      {entry.details && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {entry.details}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {entry.performedBy}
                        </span>
                        {entry.ipAddress && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {entry.ipAddress}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
