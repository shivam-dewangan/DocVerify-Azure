const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ApiDocument {
  id: string;
  fileName: string;
  hash: string;
  algorithm: string;
  size: number;
  contentType: string;
  uploadedAt: string;
  status: string;
}

export interface UploadResponse {
  success: boolean;
  documentId: string;
  fileName: string;
  hash: string;
  size: number;
  uploadedAt: string;
}

export interface VerificationResponse {
  success: boolean;
  documentId: string;
  fileName: string;
  isValid: boolean;
  verification: {
    isValid: boolean;
    actualHash: string;
    expectedHash: string;
    algorithm: string;
  };
  verifiedAt: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('document', file);

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  async verifyDocument(documentId: string, file: File): Promise<VerificationResponse> {
    const formData = new FormData();
    formData.append('document', file);

    const response = await fetch(`${API_BASE_URL}/documents/verify/${documentId}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Verification failed' }));
      throw new Error(error.error || 'Verification failed');
    }

    return response.json();
  }

  async getDocuments(): Promise<{ success: boolean; documents: ApiDocument[] }> {
    return this.request('/documents');
  }

  async getDocument(documentId: string): Promise<{ success: boolean; document: ApiDocument }> {
    return this.request(`/documents/${documentId}`);
  }

  async deleteDocument(documentId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/documents/${documentId}`, { method: 'DELETE' });
  }

  async getAuditLogs(documentId?: string, limit = 100) {
    const params = new URLSearchParams();
    if (documentId) params.append('documentId', documentId);
    params.append('limit', limit.toString());
    
    return this.request(`/audit/logs?${params}`);
  }

  async getStats() {
    return this.request('/audit/stats');
  }
}

export const apiService = new ApiService();