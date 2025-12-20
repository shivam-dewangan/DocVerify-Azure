import { useState } from 'react';
import { 
  FileText, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Activity
} from 'lucide-react';
import { Document, AuditLogEntry } from '@/types/document';
import { mockDocuments, mockAuditLogs, generateHash } from '@/lib/mockData';
import { DocumentUpload } from '@/components/DocumentUpload';
import { DocumentList } from '@/components/DocumentList';
import { AuditLog } from '@/components/AuditLog';
import { StatsCard } from '@/components/StatsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Index = () => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(mockAuditLogs);

  const handleUpload = (newDocument: Document) => {
    setDocuments(prev => [newDocument, ...prev]);
    
    const uploadLog: AuditLogEntry = {
      id: crypto.randomUUID(),
      documentId: newDocument.id,
      documentName: newDocument.name,
      action: 'upload',
      performedBy: 'current.user@company.com',
      timestamp: new Date(),
      details: 'Document uploaded successfully',
      ipAddress: '192.168.1.1',
    };
    
    const hashLog: AuditLogEntry = {
      id: crypto.randomUUID(),
      documentId: newDocument.id,
      documentName: newDocument.name,
      action: 'hash_generated',
      performedBy: 'system',
      timestamp: new Date(),
      details: 'SHA-256 hash generated',
    };
    
    setAuditLogs(prev => [hashLog, uploadLog, ...prev]);
  };

  const handleVerify = (id: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        return { ...doc, status: 'verified', verifiedAt: new Date() };
      }
      return doc;
    }));
    
    const doc = documents.find(d => d.id === id);
    if (doc) {
      const verifyLog: AuditLogEntry = {
        id: crypto.randomUUID(),
        documentId: id,
        documentName: doc.name,
        action: 'verify',
        performedBy: 'current.user@company.com',
        timestamp: new Date(),
        details: 'Document integrity verified',
        ipAddress: '192.168.1.1',
      };
      setAuditLogs(prev => [verifyLog, ...prev]);
      toast.success(`${doc.name} verified successfully`);
    }
  };

  const handleDelete = (id: string) => {
    const doc = documents.find(d => d.id === id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    
    if (doc) {
      const deleteLog: AuditLogEntry = {
        id: crypto.randomUUID(),
        documentId: id,
        documentName: doc.name,
        action: 'delete',
        performedBy: 'current.user@company.com',
        timestamp: new Date(),
        details: 'Document deleted',
        ipAddress: '192.168.1.1',
      };
      setAuditLogs(prev => [deleteLog, ...prev]);
      toast.success(`${doc.name} deleted`);
    }
  };

  const stats = {
    total: documents.length,
    verified: documents.filter(d => d.status === 'verified').length,
    pending: documents.filter(d => d.status === 'pending').length,
    failed: documents.filter(d => d.status === 'failed').length,
  };

  return (
    <div className="min-h-screen gradient-surface">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="gradient-primary rounded-lg p-2">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">DocVerify</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Document Verification System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-accent">AU</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Manage document verification and audit trails
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Documents"
            value={stats.total}
            icon={FileText}
            description="All uploaded documents"
          />
          <StatsCard
            title="Verified"
            value={stats.verified}
            icon={CheckCircle2}
            variant="success"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Failed"
            value={stats.failed}
            icon={AlertTriangle}
            variant="default"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="documents" className="space-y-6">
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
      <footer className="border-t border-border bg-card/50 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 DocVerify. All documents are encrypted and securely stored.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>SHA-256 Hashing</span>
              <span>•</span>
              <span>Enterprise Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
