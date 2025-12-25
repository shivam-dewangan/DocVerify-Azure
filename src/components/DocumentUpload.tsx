import { useState, useCallback } from 'react';
import { Upload, File, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/mockData';
import { Document } from '@/types/document';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

interface DocumentUploadProps {
  onUpload: (document: Document) => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'hashing' | 'complete';
}

export function DocumentUpload({ onUpload }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const uploadFile = useCallback(async (file: File) => {
    const uploadingFile: UploadingFile = {
      file,
      progress: 0,
      status: 'uploading',
    };

    setUploadingFiles(prev => [...prev, uploadingFile]);

    try {
      setUploadingFiles(prev =>
        prev.map(f =>
          f.file === file ? { ...f, progress: 50 } : f
        )
      );

      const response = await apiService.uploadDocument(file);

      setUploadingFiles(prev =>
        prev.map(f =>
          f.file === file ? { ...f, status: 'hashing', progress: 80 } : f
        )
      );

      setUploadingFiles(prev =>
        prev.map(f =>
          f.file === file ? { ...f, status: 'complete', progress: 100 } : f
        )
      );

      const newDocument: Document = {
        id: response.documentId,
        name: response.fileName,
        size: response.size,
        type: file.type,
        hash: response.hash,
        uploadedAt: new Date(response.uploadedAt),
        verifiedAt: new Date(response.uploadedAt),
        status: 'verified',
      };

      onUpload(newDocument);
      toast.success(`${file.name} uploaded and verified`);

      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.file !== file));
      }, 1000);
    } catch (error) {
      toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploadingFiles(prev => prev.filter(f => f.file !== file));
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => uploadFile(file));
  }, [uploadFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => uploadFile(file));
    e.target.value = '';
  }, [uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          'relative border-2 border-dashed transition-all duration-300 cursor-pointer neon-card',
          isDragging
            ? 'border-accent bg-accent/10 scale-[1.02] shadow-neon'
            : 'border-border hover:border-accent/50 hover:bg-muted/50 hover:shadow-glow'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className={cn(
            'rounded-full p-3 mb-3 transition-all duration-300 animate-float',
            isDragging ? 'bg-accent/20 shadow-glow' : 'bg-muted'
          )}>
            <Upload className={cn(
              'w-6 h-6 transition-colors duration-300',
              isDragging ? 'text-accent animate-glow-pulse' : 'text-muted-foreground'
            )} />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1 animate-fade-in">
            {isDragging ? 'Drop files here' : 'Upload Documents'}
          </h3>
          <p className="text-xs text-muted-foreground mb-3 animate-fade-in text-center">
            Drag and drop files or click to browse
          </p>
          <Button variant="outline" size="sm" className="pointer-events-none animate-scale-in text-xs">
            Select Files
          </Button>
        </div>
      </Card>

      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index} className="p-4 animate-slide-in neon-card" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'rounded-lg p-2 transition-colors',
                  uploadingFile.status === 'complete' ? 'bg-success/10' : 'bg-muted'
                )}>
                  {uploadingFile.status === 'complete' ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <File className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">
                      {uploadingFile.file.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatFileSize(uploadingFile.file.size)}
                    </span>
                  </div>
                  {uploadingFile.status === 'hashing' ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin text-accent" />
                      <span className="text-xs text-accent font-medium">
                        Generating hash...
                      </span>
                    </div>
                  ) : uploadingFile.status === 'complete' ? (
                    <span className="text-xs text-success font-medium">
                      Verified ✓
                    </span>
                  ) : (
                    <Progress value={uploadingFile.progress} className="h-1.5" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}