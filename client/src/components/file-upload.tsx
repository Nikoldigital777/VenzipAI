
import { useState, useCallback, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  X, 
  Eye, 
  Download,
  Tag,
  Calendar,
  User,
  Shield,
  ZoomIn,
  ZoomOut
} from "lucide-react";

type UploadResult = { 
  id: string; 
  fileName: string; 
  fileType: string; 
  fileSize: number; 
  filePath: string;
  status: string;
  analysisResult?: any;
  uploadedAt: string;
};

interface FileUploadProps {
  frameworkId?: string;
  onUploadComplete?: (file: UploadResult) => void;
}

export default function FileUpload({ frameworkId, onUploadComplete }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string>("");
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch uploaded documents
  const { data: documentsResponse } = useQuery<{items: UploadResult[]}>({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/documents");
      return response.json();
    },
  });
  
  const documents = documentsResponse?.items || [];

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const xhr = new XMLHttpRequest();
      
      return new Promise<UploadResult>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', '/api/documents/upload');
        xhr.send(formData);
      });
    },
    onSuccess: (data) => {
      setUploadProgress(0);
      setSelectedFile(null);
      setPreviewUrl(null);
      setCategory("");
      setTags("");
      setDescription("");
      setPdfText("");
      setPdfPageCount(0);
      setCurrentPage(1);
      setZoomLevel(1);
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      onUploadComplete?.(data);
    },
    onError: () => {
      setUploadProgress(0);
    }
  });

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setSelectedFile(file);
    
    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
    
    // Handle PDF files
    if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Extract text from PDF using pdfjs-dist
      try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Import pdfjs-dist dynamically
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfPageCount(pdf.numPages);
        
        let fullText = '';
        
        // Extract text from each page (limit to first 10 pages for performance)
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n\n';
        }
        
        setPdfText(fullText.trim());
        
      } catch (error) {
        console.error('Error processing PDF:', error);
        setPdfText("PDF text extraction failed. Upload will proceed with filename analysis only.");
      }
    }
  }, []);

  const handleUpload = () => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    if (frameworkId) formData.append("frameworkId", frameworkId);
    if (category) formData.append("category", category);
    if (tags) formData.append("tags", tags);
    if (description) formData.append("description", description);
    if (pdfText) formData.append("extractedText", pdfText);
    
    mutation.mutate(formData);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.currentTarget.value = "";
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const categories = [
    "Policy Document",
    "Procedure Manual", 
    "Risk Assessment",
    "Training Material",
    "Audit Report",
    "Evidence Document",
    "Contract/Agreement",
    "Technical Documentation",
    "Other"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Evidence Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Upload Area */}
          <div
            onDragEnter={onDrag}
            onDragOver={onDrag}
            onDragLeave={onDrag}
            onDrop={onDrop}
            className={[
              "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
              dragActive ? "border-venzip-primary bg-venzip-primary/5" : "border-gray-300",
              selectedFile ? "border-venzip-primary bg-venzip-primary/5" : ""
            ].join(" ")}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  {getFileIcon(selectedFile.type)}
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setPdfText("");
                      setPdfPageCount(0);
                      setCurrentPage(1);
                      setZoomLevel(1);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* File Preview */}
                {previewUrl && selectedFile && (
                  <div className="mt-4">
                    {selectedFile.type.startsWith('image/') ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-w-full max-h-40 mx-auto rounded-lg border"
                      />
                    ) : selectedFile.type === 'application/pdf' ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm font-medium">PDF Preview</span>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}>
                              <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
                            <Button variant="ghost" size="sm" onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}>
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4 bg-white">
                          <embed
                            src={previewUrl}
                            type="application/pdf"
                            width="100%"
                            height="300px"
                            className="rounded border"
                          />
                        </div>
                        
                        {pdfText && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="text-sm font-medium mb-2">Extracted Content Preview</h4>
                            <p className="text-xs text-gray-600 line-clamp-3">{pdfText}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <File className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">File ready for upload</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Progress */}
                {mutation.isPending && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop a file here, or click to select
                </p>
                <label className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-venzip-primary text-white cursor-pointer hover:bg-venzip-primary/90">
                  Choose file
                  <input
                    type="file"
                    className="hidden"
                    onChange={onInput}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
                  />
                </label>
              </>
            )}
          </div>

          {/* File Metadata */}
          {selectedFile && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="security, audit, policy"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the document"
                />
              </div>

              <Button 
                onClick={handleUpload}
                disabled={mutation.isPending}
                className="w-full"
              >
                {mutation.isPending ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          )}

          {mutation.isError && (
            <div className="mt-4 text-sm text-red-600">
              {(mutation.error as Error).message || "Upload failed"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No documents uploaded yet
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc: UploadResult) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {getFileIcon(doc.fileType)}
                    <div className="flex-1">
                      <p className="font-medium">{doc.fileName}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                        <Badge variant={doc.status === 'verified' ? 'default' : 'secondary'}>
                          {doc.status}
                        </Badge>
                        {doc.analysisResult && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            AI Analyzed
                          </Badge>
                        )}
                      </div>
                      
                      {/* AI Analysis Results */}
                      {doc.analysisResult && (
                        <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200/30">
                          <div className="flex items-start gap-2">
                            <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="text-sm">
                                <span className="font-medium text-blue-800">AI Analysis:</span>
                                <span className="text-blue-700 ml-2">{doc.analysisResult.summary}</span>
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600">Risk Level:</span>
                                  <Badge 
                                    variant="outline" 
                                    className={
                                      doc.analysisResult.risk_level === 'high' ? 'border-red-300 bg-red-50 text-red-700' :
                                      doc.analysisResult.risk_level === 'medium' ? 'border-orange-300 bg-orange-50 text-orange-700' :
                                      'border-green-300 bg-green-50 text-green-700'
                                    }
                                  >
                                    {doc.analysisResult.risk_level}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600">Type:</span>
                                  <span className="text-blue-800 font-medium">{doc.analysisResult.document_type}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600">Completeness:</span>
                                  <span className="text-blue-800 font-medium">{doc.analysisResult.completeness_score}%</span>
                                </div>
                              </div>
                              
                              {doc.analysisResult.compliance_gaps && doc.analysisResult.compliance_gaps.length > 0 && (
                                <div className="text-xs">
                                  <span className="text-red-600 font-medium">Gaps Found:</span>
                                  <span className="text-red-700 ml-1">{doc.analysisResult.compliance_gaps.length} compliance gap(s)</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {doc.fileType === 'application/pdf' ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>{doc.fileName}</DialogTitle>
                          </DialogHeader>
                          <div className="flex-1 overflow-auto">
                            <embed
                              src={`/api/documents/${doc.id}/view`}
                              type="application/pdf"
                              width="100%"
                              height="600px"
                              className="rounded border"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
