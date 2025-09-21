
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, 
  Shield, 
  Download, 
  FileCheck, 
  Hash, 
  Calendar,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Folder,
  Eye,
  Lock,
  Loader2,
  Archive,
  FileArchive
} from 'lucide-react';

interface Framework {
  id: string;
  name: string;
  displayName: string;
}

interface AuditPackageConfig {
  frameworkIds: string[];
  includeEvidence: boolean;
  includeReports: boolean;
}

interface Document {
  id: string;
  fileName: string;
  status: string;
  uploadedAt: string;
  sha256Hash: string;
  verifiedAt?: string;
  validUntil?: string;
  isExpired?: boolean;
  filePath: string;
}

export default function AuditPackage() {
  const [activeTab, setActiveTab] = useState('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<AuditPackageConfig>({
    frameworkIds: [],
    includeEvidence: true,
    includeReports: true
  });
  const { toast } = useToast();

  // Fetch frameworks
  const { data: frameworks = [], isLoading: frameworksLoading } = useQuery<Framework[]>({
    queryKey: ["/api/frameworks"],
  });

  // Fetch documents for preview
  const { data: documentsData } = useQuery<{ documents: Document[] }>({
    queryKey: ["/api/documents"],
  });

  const documents = documentsData?.documents || [];
  const verifiedDocuments = documents.filter(doc => doc.status === 'verified');

  const generateAuditPackage = async () => {
    if (config.frameworkIds.length === 0) {
      toast({
        title: "Select Frameworks",
        description: "Please select at least one framework for the audit package.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/audit-package/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate audit package: ${response.status} ${errorText}`);
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : 'audit-package.zip';

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
      }, 100);

      toast({
        title: "Package Generated",
        description: `Your audit package has been generated and downloaded successfully.`,
      });

    } catch (error) {
      console.error('Error generating audit package:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unable to generate audit package. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50/80 via-white/50 to-venzip-primary/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-venzip-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-venzip-accent/10 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        {/* Header Section */}
        <div className="mb-12 text-center animate-fadeInUp">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Audit <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero animate-gradient-x">Package Generator</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Generate comprehensive audit packages with evidence, reports, and compliance documentation
          </p>
        </div>

        <Card className="glass-card group hover-lift animate-fadeInUp" style={{animationDelay: '0.2s'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-gray-900">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                <Package className="h-6 w-6 text-blue-600 group-hover:animate-bounce" />
              </div>
              <div>
                <div className="text-xl font-bold">Audit Package Generator</div>
                <div className="text-sm text-gray-500 font-normal">Create professional audit-ready packages</div>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative z-10 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 backdrop-blur-sm">
                <TabsTrigger value="generate" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Archive className="h-4 w-4 mr-2" />
                  Generate Package
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Package Preview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="generate" className="space-y-6 mt-6">
                {/* Framework Selection */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold text-gray-900">Compliance Frameworks</Label>
                    <p className="text-sm text-gray-500 mb-3">Select frameworks to include in the audit package</p>
                    
                    {frameworksLoading ? (
                      <div className="flex items-center gap-2 p-4 bg-gray-50/80 rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">Loading frameworks...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {frameworks.map((framework) => (
                          <div key={framework.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-xl border border-blue-200/30 hover:shadow-md transition-shadow duration-300">
                            <Checkbox
                              id={framework.id}
                              checked={config.frameworkIds.includes(framework.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setConfig({
                                    ...config,
                                    frameworkIds: [...config.frameworkIds, framework.id]
                                  });
                                } else {
                                  setConfig({
                                    ...config,
                                    frameworkIds: config.frameworkIds.filter(id => id !== framework.id)
                                  });
                                }
                              }}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <Label htmlFor={framework.id} className="flex-1 font-medium text-blue-800 cursor-pointer">
                              {framework.displayName}
                            </Label>
                            <Shield className="h-4 w-4 text-blue-600" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Package Options */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-gray-900">Package Contents</Label>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50/80 to-blue-50/80 rounded-xl border border-green-200/30">
                        <Checkbox
                          id="includeEvidence"
                          checked={config.includeEvidence}
                          onCheckedChange={(checked) => setConfig({ ...config, includeEvidence: checked as boolean })}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                        <div className="flex-1">
                          <Label htmlFor="includeEvidence" className="font-medium text-green-800 cursor-pointer">
                            Include Evidence Documents
                          </Label>
                          <p className="text-xs text-green-600 mt-1">All verified evidence files with metadata and provenance</p>
                        </div>
                        <FileCheck className="h-4 w-4 text-green-600" />
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50/80 to-pink-50/80 rounded-xl border border-purple-200/30">
                        <Checkbox
                          id="includeReports"
                          checked={config.includeReports}
                          onCheckedChange={(checked) => setConfig({ ...config, includeReports: checked as boolean })}
                          className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                        />
                        <div className="flex-1">
                          <Label htmlFor="includeReports" className="font-medium text-purple-800 cursor-pointer">
                            Include Compliance Reports
                          </Label>
                          <p className="text-xs text-purple-600 mt-1">PDF reports including compliance summary and gap analysis</p>
                        </div>
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="pt-4">
                    <Button
                      onClick={generateAuditPackage}
                      disabled={isGenerating || config.frameworkIds.length === 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1 transform transition-all duration-300 font-medium py-3 group"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Generating Package...
                        </>
                      ) : (
                        <>
                          <Package className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                          Generate Audit Package
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="space-y-6 mt-6">
                {/* Package Preview */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 rounded-xl p-6 border border-gray-200/50">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileArchive className="h-5 w-5 text-blue-600" />
                      Package Contents Preview
                    </h4>
                    
                    {/* Package Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white/80 rounded-lg p-3 text-center border border-white/50">
                        <div className="text-2xl font-bold text-blue-600">{config.frameworkIds.length}</div>
                        <div className="text-xs text-gray-600">Frameworks</div>
                      </div>
                      <div className="bg-white/80 rounded-lg p-3 text-center border border-white/50">
                        <div className="text-2xl font-bold text-green-600">{verifiedDocuments.length}</div>
                        <div className="text-xs text-gray-600">Evidence Files</div>
                      </div>
                      <div className="bg-white/80 rounded-lg p-3 text-center border border-white/50">
                        <div className="text-2xl font-bold text-purple-600">{config.includeReports ? config.frameworkIds.length * 2 : 0}</div>
                        <div className="text-xs text-gray-600">Reports</div>
                      </div>
                      <div className="bg-white/80 rounded-lg p-3 text-center border border-white/50">
                        <div className="text-2xl font-bold text-orange-600">1</div>
                        <div className="text-xs text-gray-600">Manifest</div>
                      </div>
                    </div>

                    {/* Selected Frameworks */}
                    {config.frameworkIds.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Selected Frameworks:</h5>
                        <div className="flex flex-wrap gap-2">
                          {config.frameworkIds.map((frameworkId) => {
                            const framework = frameworks.find(f => f.id === frameworkId);
                            return (
                              <Badge key={frameworkId} className="bg-blue-100 text-blue-800 border-blue-200">
                                <Shield className="h-3 w-3 mr-1" />
                                {framework?.displayName || frameworkId}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Evidence Preview */}
                    {config.includeEvidence && verifiedDocuments.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Evidence Documents ({verifiedDocuments.length}):</h5>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {verifiedDocuments.slice(0, 10).map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-2 bg-white/60 rounded border border-white/80 text-sm">
                              <div className="flex items-center gap-2">
                                <FileCheck className="h-4 w-4 text-green-500" />
                                <span className="font-medium truncate max-w-xs">{doc.fileName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-700 text-xs">Verified</Badge>
                                <span className="text-xs text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                          {verifiedDocuments.length > 10 && (
                            <div className="text-xs text-gray-500 text-center py-2">
                              ... and {verifiedDocuments.length - 10} more documents
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Package Structure */}
                  <div className="bg-gradient-to-r from-gray-50/80 to-purple-50/80 rounded-xl p-6 border border-gray-200/50">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Folder className="h-5 w-5 text-purple-600" />
                      Package Structure
                    </h4>
                    
                    <div className="space-y-2 text-sm font-mono">
                      <div className="text-gray-700">📦 audit-package.zip</div>
                      <div className="ml-4 text-gray-600">├── 📄 audit-manifest.json</div>
                      {config.includeReports && (
                        <div className="ml-4 text-gray-600">├── 📁 reports/</div>
                      )}
                      {config.includeEvidence && (
                        <>
                          <div className="ml-4 text-gray-600">├── 📁 evidence/</div>
                          <div className="ml-8 text-gray-500">├── 📁 documents/</div>
                          <div className="ml-8 text-gray-500">└── 📁 metadata/</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Package Info */}
            <div className="bg-gray-50/80 rounded-lg p-4 border border-gray-200/50">
              <h5 className="font-medium text-gray-900 mb-2 text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                📋 Package Information
              </h5>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• <strong>Audit Manifest:</strong> Complete package metadata with timestamps and hashes</li>
                <li>• <strong>Evidence Files:</strong> All verified documents with original metadata preserved</li>
                <li>• <strong>Compliance Reports:</strong> Professional PDF reports for each framework</li>
                <li>• <strong>Digital Signatures:</strong> Cryptographic verification of package integrity</li>
                <li>• <strong>Audit Trail:</strong> Complete provenance chain for compliance verification</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
