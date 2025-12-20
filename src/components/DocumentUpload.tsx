import { useState, useCallback } from 'react';
import { Upload, File, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatFileSize, generateHash } from '@/lib/mockData';
import { Document } from '@/types/document';
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

  const simulateUpload = useCallback(async (file: File) => {
    const uploadingFile: UploadingFile = {
      file,
      progress: 0,
      status: 'uploading',
    };

    setUploadingFiles(prev => [...prev, uploadingFile]);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadingFiles(prev =>
        prev.map(f =>
          f.file === file ? { ...f, progress: i } : f
        )
      );
    }

    // Simulate hashing
    setUploadingFiles(prev =>
      prev.map(f =>
        f.file === file ? { ...f, status: 'hashing' } : f
      )
    );
    await new Promise(resolve => setTimeout(resolve, 800));

    // Complete
    setUploadingFiles(prev =>
      prev.map(f =>
        f.file === file ? { ...f, status: 'complete' } : f
      )
    );

    const newDocument: Document = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      hash: generateHash(),
      uploadedAt: new Date(),
      verifiedAt: new Date(),
      status: 'verified',
    };

    onUpload(newDocument);
    toast.success(`${file.name} uploaded and verified`);

    // Remove from uploading list after animation
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(f => f.file !== file));
    }, 1000);
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => simulateUpload(file));
  }, [simulateUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => simulateUpload(file));
    e.target.value = '';
  }, [simulateUpload]);

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
          'relative border-2 border-dashed transition-all duration-200 cursor-pointer',
          isDragging
            ? 'border-accent bg-accent/5 scale-[1.01]'
            : 'border-border hover:border-accent/50 hover:bg-muted/50'
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
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className={cn(
            'rounded-full p-4 mb-4 transition-colors',
            isDragging ? 'bg-accent/10' : 'bg-muted'
          )}>
            <Upload className={cn(
              'w-8 h-8 transition-colors',
              isDragging ? 'text-accent' : 'text-muted-foreground'
            )} />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {isDragging ? 'Drop files here' : 'Upload Documents'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop files or click to browse
          </p>
          <Button variant="outline" size="sm" className="pointer-events-none">
            Select Files
          </Button>
        </div>
      </Card>

      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index} className="p-4 animate-fade-in">
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
