import { useState, useEffect } from 'react';
import { 
  FileText, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Activity
} from 'lucide-react';
import { Document, AuditLogEntry } from '@/types/document';
import { apiService } from '@/services/api';
import { DocumentUpload } from '@/components/DocumentUpload';
import { DocumentList } from '@/components/DocumentList';
import { AuditLog } from '@/components/AuditLog';
import { StatsCard } from '@/components/StatsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Index = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [docsResponse, logsResponse] = await Promise.all([
        apiService.getDocuments(),
        apiService.getAuditLogs()
      ]);
      
      if (docsResponse.success) {
        const mappedDocs = docsResponse.documents.map(doc => ({
          id: doc.id,
          name: doc.fileName,
          size: doc.size,
          type: doc.contentType,
          hash: doc.hash,
          uploadedAt: new Date(doc.uploadedAt),
          verifiedAt: new Date(doc.uploadedAt),
          status: doc.status === 'active' ? 'verified' : 'pending'
        }));
        setDocuments(mappedDocs);
      }
      
      if (logsResponse.success) {
        const mappedLogs = logsResponse.logs.map(log => ({
          id: log.id,
          documentId: log.documentId,
          documentName: log.details?.fileName || 'Unknown',
          action: log.action,
          performedBy: 'system',
          timestamp: new Date(log.timestamp),
          details: log.result,
          ipAddress: log.ipAddress
        }));
        setAuditLogs(mappedLogs);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (newDocument: Document) => {
    setDocuments(prev => [newDocument, ...prev]);
    loadData();
  };

  const handleVerify = async (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    
    toast.info('Re-verification requires uploading the document again');
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Document deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const stats = {
    total: documents.length,
    verified: documents.filter(d => d.status === 'verified').length,
    pending: documents.filter(d => d.status === 'pending').length,
    failed: documents.filter(d => d.status === 'failed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col gradient-surface">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 animate-slide-in">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="gradient-primary rounded-lg p-2 shadow-glow">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">DocVerify</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Document Verification System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                <span className="text-sm font-semibold text-accent">AU</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Page Title */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Manage document verification and audit trails
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <StatsCard
              title="Total Documents"
              value={stats.total}
              icon={FileText}
              description="All uploaded documents"
            />
          </div>
          <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <StatsCard
              title="Verified"
              value={stats.verified}
              icon={CheckCircle2}
              variant="success"
              trend={{ value: 12, isPositive: true }}
            />
          </div>
          <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <StatsCard
              title="Pending"
              value={stats.pending}
              icon={Clock}
              variant="warning"
            />
          </div>
          <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <StatsCard
              title="Failed"
              value={stats.failed}
              icon={AlertTriangle}
              variant="default"
            />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="documents" className="space-y-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <Activity className="w-4 h-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <h3 className="text-lg font-semibold text-foreground mb-4">Upload</h3>
                <DocumentUpload onUpload={handleUpload} />
              </div>
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Documents ({documents.length})
                </h3>
                <DocumentList
                  documents={documents}
                  onVerify={handleVerify}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Activity Log ({auditLogs.length} entries)
              </h3>
            </div>
            <AuditLog entries={auditLogs} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-card/80 backdrop-blur-sm animate-fade-in mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="gradient-primary rounded-lg p-1.5 shadow-glow">
                  <Shield className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground">DocVerify</span>
              </div>
              <p className="text-sm text-muted-foreground text-center sm:text-left">
                © 2024 DocVerify. All documents are encrypted and securely stored.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-glow-pulse"></div>
                <span>SHA-256 Hashing</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-glow-pulse"></div>
                <span>Enterprise Security</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning animate-glow-pulse"></div>
                <span>Azure Cloud</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;