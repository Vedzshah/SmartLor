import { useCallback, useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResumeUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  uploadedFileName?: string;
  onRemove?: () => void;
}

export function ResumeUpload({ 
  onFileSelect, 
  isUploading, 
  uploadedFileName,
  onRemove 
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type === 'application/pdf' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword' ||
        file.type === 'text/plain')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  if (uploadedFileName) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{uploadedFileName}</p>
              <p className="text-xs text-muted-foreground">Resume uploaded successfully</p>
            </div>
          </div>
          
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              data-testid="button-remove-resume"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-2 border-dashed transition-all",
        isDragging && "border-primary bg-primary/5",
        !isDragging && "border-border"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label htmlFor="resume-upload" className="block cursor-pointer">
        <div className="p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isUploading ? "Uploading resume..." : "Drop your resume here, or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF, DOC, DOCX, and TXT files (max 10MB)
            </p>
          </div>
          
          <input
            id="resume-upload"
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileInput}
            disabled={isUploading}
            data-testid="input-resume-upload"
          />
        </div>
      </label>
    </Card>
  );
}
