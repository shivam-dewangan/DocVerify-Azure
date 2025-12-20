import { Document, AuditLogEntry } from '@/types/document';

export const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'contract_2024_q1.pdf',
    size: 2458624,
    type: 'application/pdf',
    hash: 'a3f2b8c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    uploadedAt: new Date('2024-01-15T10:30:00'),
    verifiedAt: new Date('2024-01-15T10:30:05'),
    status: 'verified',
  },
  {
    id: '2',
    name: 'financial_report_2023.xlsx',
    size: 1048576,
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    hash: 'b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
    uploadedAt: new Date('2024-01-14T14:20:00'),
    verifiedAt: new Date('2024-01-14T14:20:03'),
    status: 'verified',
  },
  {
    id: '3',
    name: 'compliance_audit.docx',
    size: 524288,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    hash: 'c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
    uploadedAt: new Date('2024-01-13T09:15:00'),
    status: 'pending',
  },
  {
    id: '4',
    name: 'security_policy_v2.pdf',
    size: 3145728,
    type: 'application/pdf',
    hash: 'd6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
    uploadedAt: new Date('2024-01-12T16:45:00'),
    verifiedAt: new Date('2024-01-12T16:45:02'),
    status: 'failed',
  },
];

export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: '1',
    documentId: '1',
    documentName: 'contract_2024_q1.pdf',
    action: 'upload',
    performedBy: 'admin@company.com',
    timestamp: new Date('2024-01-15T10:30:00'),
    details: 'Document uploaded successfully',
    ipAddress: '192.168.1.100',
  },
  {
    id: '2',
    documentId: '1',
    documentName: 'contract_2024_q1.pdf',
    action: 'hash_generated',
    performedBy: 'system',
    timestamp: new Date('2024-01-15T10:30:02'),
    details: 'SHA-256 hash generated',
  },
  {
    id: '3',
    documentId: '1',
    documentName: 'contract_2024_q1.pdf',
    action: 'verify',
    performedBy: 'admin@company.com',
    timestamp: new Date('2024-01-15T10:30:05'),
    details: 'Document integrity verified',
    ipAddress: '192.168.1.100',
  },
  {
    id: '4',
    documentId: '2',
    documentName: 'financial_report_2023.xlsx',
    action: 'upload',
    performedBy: 'finance@company.com',
    timestamp: new Date('2024-01-14T14:20:00'),
    details: 'Document uploaded successfully',
    ipAddress: '192.168.1.105',
  },
  {
    id: '5',
    documentId: '2',
    documentName: 'financial_report_2023.xlsx',
    action: 'integrity_check',
    performedBy: 'audit@company.com',
    timestamp: new Date('2024-01-14T15:00:00'),
    details: 'Integrity check passed',
    ipAddress: '192.168.1.110',
  },
  {
    id: '6',
    documentId: '3',
    documentName: 'compliance_audit.docx',
    action: 'upload',
    performedBy: 'legal@company.com',
    timestamp: new Date('2024-01-13T09:15:00'),
    details: 'Document uploaded, pending verification',
    ipAddress: '192.168.1.120',
  },
  {
    id: '7',
    documentId: '4',
    documentName: 'security_policy_v2.pdf',
    action: 'verify',
    performedBy: 'system',
    timestamp: new Date('2024-01-12T16:45:02'),
    details: 'Verification failed - hash mismatch detected',
  },
];

export const generateHash = (): string => {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
