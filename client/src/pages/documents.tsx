import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Document } from "@shared/schema";
import Navigation from "@/components/navigation";
import AIChat from "@/components/ai-chat";
import FileUpload from "@/components/file-upload";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Documents() {
  const [showUpload, setShowUpload] = useState(false);

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return { icon: 'fas fa-file-pdf', color: 'text-danger-coral', bg: 'bg-danger-coral/10' };
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return { icon: 'fas fa-file-excel', color: 'text-success-green', bg: 'bg-success-green/10' };
    if (fileType.includes('word') || fileType.includes('document')) return { icon: 'fas fa-file-word', color: 'text-info-blue', bg: 'bg-info-blue/10' };
    if (fileType.includes('image')) return { icon: 'fas fa-file-image', color: 'text-venzip-primary', bg: 'bg-venzip-primary/10' };
    return { icon: 'fas fa-file', color: 'text-gray-500', bg: 'bg-gray-100' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-success-green/20 text-success-green';
      case 'pending': return 'bg-warning-orange/20 text-warning-orange';
      case 'rejected': return 'bg-danger-coral/20 text-danger-coral';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getFrameworkColor = (frameworkId: string) => {
    if (!frameworkId) return 'bg-gray-100 text-gray-600';
    if (frameworkId.includes('soc2')) return 'bg-venzip-primary/20 text-venzip-primary';
    if (frameworkId.includes('iso27001')) return 'bg-venzip-accent/20 text-venzip-accent';
    if (frameworkId.includes('hipaa')) return 'bg-danger-coral/20 text-danger-coral';
    if (frameworkId.includes('gdpr')) return 'bg-venzip-secondary/20 text-venzip-secondary';
    return 'bg-gray-100 text-gray-600';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'No date';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
          <div className="glass-card p-8 rounded-2xl">
            <div className="w-8 h-8 border-4 border-venzip-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          
          {/* Documents Header */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Evidence Library</h1>
                  <p className="text-gray-600">Upload and manage your compliance documentation</p>
                </div>
                <Button 
                  onClick={() => setShowUpload(!showUpload)}
                  className="bg-gradient-primary text-white hover:shadow-lg transition-all duration-200"
                  data-testid="button-upload-document"
                >
                  <i className="fas fa-upload mr-2"></i>Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Area */}
          {showUpload && (
            <Card className="glass-card animate-slide-up">
              <CardContent className="p-8">
                <FileUpload onUploadSuccess={() => setShowUpload(false)} />
              </CardContent>
            </Card>
          )}

          {/* Document List */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Documents</h2>
              <div className="space-y-4">
                {documents.length === 0 ? (
                  <div className="text-center py-12" data-testid="no-documents">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-file-alt text-gray-400 text-xl"></i>
                    </div>
                    <p className="text-gray-500">No documents uploaded yet</p>
                    <p className="text-sm text-gray-400">Upload your first compliance document to get started</p>
                  </div>
                ) : (
                  documents.map((document) => {
                    const fileIcon = getFileIcon(document.fileType);
                    return (
                      <div 
                        key={document.id} 
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-venzip-primary/30 transition-all duration-200"
                        data-testid={`document-${document.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 ${fileIcon.bg} rounded-lg flex items-center justify-center`}>
                            <i className={`${fileIcon.icon} ${fileIcon.color}`}></i>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{document.fileName}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              {document.frameworkId && (
                                <Badge className={getFrameworkColor(document.frameworkId)}>
                                  {document.frameworkId.toUpperCase()}
                                </Badge>
                              )}
                              <span className="text-sm text-gray-500">
                                Updated: {document.uploadedAt ? formatDate(document.uploadedAt) : 'No date'}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatFileSize(document.fileSize)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(document.status)}>
                            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                          </Badge>
                          <Button variant="ghost" size="sm" data-testid={`download-${document.id}`}>
                            <i className="fas fa-download text-gray-400 hover:text-gray-600"></i>
                          </Button>
                          <Button variant="ghost" size="sm" data-testid={`menu-${document.id}`}>
                            <i className="fas fa-ellipsis-v text-gray-400 hover:text-gray-600"></i>
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AIChat />
    </>
  );
}
