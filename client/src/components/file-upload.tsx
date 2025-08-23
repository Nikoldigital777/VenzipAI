import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FileUploadProps {
  onUploadSuccess?: () => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [frameworkId, setFrameworkId] = useState<string>("");

  const uploadMutation = useMutation({
    mutationFn: async ({ file, frameworkId }: { file: File; frameworkId?: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (frameworkId) {
        formData.append('frameworkId', frameworkId);
      }

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setSelectedFile(null);
      setFrameworkId("");
      toast({
        title: "Success",
        description: "Document uploaded and analyzed successfully",
      });
      onUploadSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const validateFile = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/gif'
    ];

    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, DOC, DOCX, XLS, XLSX, or image files only",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 50MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadMutation.mutate({ file: selectedFile, frameworkId: frameworkId || undefined });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Drag and Drop Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
          dragActive
            ? "border-venzip-primary/50 bg-venzip-primary/5"
            : "border-venzip-primary/30 hover:border-venzip-primary/50 hover:bg-venzip-primary/5"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
        data-testid="file-drop-zone"
      >
        <div className="w-16 h-16 bg-venzip-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-cloud-upload-alt text-venzip-primary text-2xl"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {selectedFile ? selectedFile.name : "Drag & drop files here"}
        </h3>
        <p className="text-gray-600 mb-4">
          {selectedFile ? formatFileSize(selectedFile.size) : "or click to browse your computer"}
        </p>
        <p className="text-sm text-gray-500">
          Supports PDF, DOC, DOCX, XLS, XLSX, and images up to 50MB
        </p>

        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
          data-testid="file-input"
        />
      </div>

      {/* File Preview and Framework Selection */}
      {selectedFile && (
        <div className="glass-card p-6 rounded-xl space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-venzip-primary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-file text-venzip-primary"></i>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{selectedFile.name}</h4>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
              data-testid="button-remove-file"
            >
              <i className="fas fa-times text-gray-400"></i>
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="framework-select">Associate with Framework (Optional)</Label>
              <Select value={frameworkId} onValueChange={setFrameworkId}>
                <SelectTrigger id="framework-select" data-testid="select-framework">
                  <SelectValue placeholder="Select a compliance framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soc2">SOC 2</SelectItem>
                  <SelectItem value="iso27001">ISO 27001</SelectItem>
                  <SelectItem value="hipaa">HIPAA</SelectItem>
                  <SelectItem value="gdpr">GDPR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedFile(null)}
                data-testid="button-cancel-upload"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="bg-gradient-primary text-white hover:shadow-lg transition-all duration-200"
                data-testid="button-confirm-upload"
              >
                {uploadMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload mr-2"></i>
                    Upload Document
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
