import { useState } from 'react';
import { FileText, Eye, Trash2, RefreshCw, Copy, Check, MoreVertical } from 'lucide-react';
import { Document } from '@/types/document';
import { formatFileSize } from '@/lib/mockData';
import { VerificationStatus, VerificationCard } from '@/components/VerificationStatus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DocumentListProps {
  documents: Document[];
  onVerify: (id: string) => void;
  onDelete: (id: string) => void;
}

const fileTypeIcons: Record<string, string> = {
  'application/pdf': '📄',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'default': '📁',
};

export function DocumentList({ documents, onVerify, onDelete }: DocumentListProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const getFileIcon = (type: string) => {
    return fileTypeIcons[type] || fileTypeIcons['default'];
  };

  const copyHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    toast.success('Hash copied to clipboard');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  if (documents.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <div className="rounded-full bg-muted w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No documents yet</h3>
          <p className="text-sm text-muted-foreground">
            Upload documents to generate hashes and verify integrity
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {documents.map((doc, index) => (
          <Card
            key={doc.id}
            className={cn(
              'p-4 transition-all hover:shadow-lg hover:scale-[1.02] animate-fade-in cursor-pointer neon-card duration-300',
              'hover:border-accent/30 hover:shadow-glow'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => setSelectedDocument(doc)}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{getFileIcon(doc.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-medium text-foreground truncate">{doc.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <VerificationStatus status={doc.status} size="sm" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/20 hover:shadow-glow transition-all duration-200">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDocument(doc);
                        }}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          copyHash(doc.hash);
                        }}>
                          {copiedHash === doc.hash ? (
                            <Check className="w-4 h-4 mr-2" />
                          ) : (
                            <Copy className="w-4 h-4 mr-2" />
                          )}
                          Copy Hash
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onVerify(doc.id);
                        }}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Re-verify
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(doc.id);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Hash:
                  </span>
                  <code className="hash-display flex-1 truncate">
                    {doc.hash}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 hover:bg-accent/20 hover:shadow-glow transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyHash(doc.hash);
                    }}
                  >
                    {copiedHash === doc.hash ? (
                      <Check className="w-3 h-3 text-success" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedDocument && getFileIcon(selectedDocument.type)}</span>
              <span className="truncate">{selectedDocument?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Document verification details and hash information
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4 mt-4">
              <VerificationCard
                status={selectedDocument.status}
                hash={selectedDocument.hash}
                verifiedAt={selectedDocument.verifiedAt}
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">File Size</span>
                  <p className="font-medium">{formatFileSize(selectedDocument.size)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Upload Date</span>
                  <p className="font-medium">{selectedDocument.uploadedAt.toLocaleDateString()}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">File Type</span>
                  <p className="font-medium">{selectedDocument.type}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => copyHash(selectedDocument.hash)}
                >
                  {copiedHash === selectedDocument.hash ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Hash
                    </>
                  )}
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => {
                    onVerify(selectedDocument.id);
                    setSelectedDocument(null);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-verify
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
