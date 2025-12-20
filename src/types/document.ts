export interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  hash: string;
  uploadedAt: Date;
  verifiedAt?: Date;
  status: 'verified' | 'pending' | 'failed';
}

export interface AuditLogEntry {
  id: string;
  documentId: string;
  documentName: string;
  action: 'upload' | 'verify' | 'download' | 'delete' | 'hash_generated' | 'integrity_check';
  performedBy: string;
  timestamp: Date;
  details?: string;
  ipAddress?: string;
}

export type VerificationStatus = 'verified' | 'pending' | 'failed';
