
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/file-upload";
import { 
  TestTube, 
  FileText, 
  Brain, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Loader2,
  MapPin,
  Upload
} from "lucide-react";

export default function TestDocuments() {
  const [testText, setTestText] = useState(`
Information Security Policy

1. Purpose
This policy establishes the framework for securing information assets within our organization.

2. Access Control
- All users must authenticate using multi-factor authentication
- Role-based access controls are implemented across all systems
- Access reviews are conducted quarterly

3. Data Protection
- All sensitive data must be encrypted at rest and in transit
- Regular backups are performed and tested monthly
- Data retention policies are enforced

4. Incident Response
- Security incidents must be reported within 1 hour
- Incident response team will investigate and contain threats
- Post-incident reviews are conducted for all security events
  `.trim());

  const [framework, setFramework] = useState("SOC2");
  const [filename, setFilename] = useState("security-policy.txt");

  const { toast } = useToast();

  // Test AI Analysis
  const testAIMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch("/api/test/ai-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: testText,
            framework: framework,
            filename: filename
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("AI analysis error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "AI Analysis Test Successful",
        description: `Analysis completed. API Key configured: ${data.apiKeyConfigured}`,
      });
    },
    onError: (error) => {
      toast({
        title: "AI Analysis Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });

  // Test Evidence Mapping (requires uploaded document)
  const testEvidenceMutation = useMutation({
    mutationFn: async ({ documentId }: { documentId: string }) => {
      const res = await apiRequest("POST", "/api/test/evidence-mapping", {
        documentId: documentId,
        frameworkId: framework
      });
      if (!res.ok) throw new Error("Evidence mapping test failed");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Evidence Mapping Test Successful",
        description: `Created ${data.mappingsCreated} evidence mappings`,
      });
    },
    onError: (error) => {
      toast({
        title: "Evidence Mapping Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });

  const [lastUploadedDocId, setLastUploadedDocId] = useState<string | null>(null);

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document & AI Testing</h1>
          <p className="text-gray-600">Test document upload, AI analysis, and evidence mapping functionality</p>
        </div>

        <div className="grid gap-6">
          {/* AI Analysis Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Document Analysis Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="framework">Framework</Label>
                <Input
                  id="framework"
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  placeholder="SOC2, ISO27001, HIPAA, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="filename">Filename</Label>
                <Input
                  id="filename"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="document.txt"
                />
              </div>

              <div>
                <Label htmlFor="testText">Document Content</Label>
                <Textarea
                  id="testText"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  rows={10}
                  placeholder="Paste document content here..."
                />
              </div>

              <Button 
                onClick={() => testAIMutation.mutate()}
                disabled={testAIMutation.isPending || !testText.trim()}
                className="w-full"
              >
                {testAIMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing AI Analysis...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Test AI Analysis
                  </>
                )}
              </Button>

              {testAIMutation.data && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">AI Analysis Results</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">API Key Configured:</span>
                      <Badge variant={testAIMutation.data.apiKeyConfigured ? "default" : "destructive"} className="ml-2">
                        {testAIMutation.data.apiKeyConfigured ? "Yes" : "No"}
                      </Badge>
                    </div>
                    {testAIMutation.data.analysis && (
                      <>
                        <div>
                          <span className="font-medium">Summary:</span>
                          <p className="text-gray-700 mt-1">{testAIMutation.data.analysis.summary}</p>
                        </div>
                        <div>
                          <span className="font-medium">Document Type:</span>
                          <Badge variant="outline" className="ml-2">{testAIMutation.data.analysis.document_type}</Badge>
                        </div>
                        <div>
                          <span className="font-medium">Risk Level:</span>
                          <Badge 
                            variant={testAIMutation.data.analysis.risk_level === 'high' ? "destructive" : "default"}
                            className="ml-2"
                          >
                            {testAIMutation.data.analysis.risk_level}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Completeness Score:</span>
                          <Badge variant="outline" className="ml-2">{testAIMutation.data.analysis.completeness_score}%</Badge>
                        </div>
                        {testAIMutation.data.analysis.compliance_gaps && testAIMutation.data.analysis.compliance_gaps.length > 0 && (
                          <div>
                            <span className="font-medium">Compliance Gaps:</span>
                            <Badge variant="destructive" className="ml-2">
                              {testAIMutation.data.analysis.compliance_gaps.length} gaps found
                            </Badge>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {testAIMutation.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">Test Failed</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{testAIMutation.error.message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Upload Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Document Upload Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload 
                frameworkId={framework}
                onUploadComplete={(file) => {
                  setLastUploadedDocId(file.id);
                  toast({
                    title: "Upload Successful",
                    description: `Document ${file.fileName} uploaded and analyzed`,
                  });
                }}
              />
            </CardContent>
          </Card>

          {/* Evidence Mapping Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Evidence Mapping Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Upload a document first, then test evidence mapping functionality below.
                </p>
              </div>

              <div>
                <Label>Last Uploaded Document ID</Label>
                <Input 
                  value={lastUploadedDocId || "Upload a document first"} 
                  readOnly 
                />
              </div>

              <Button 
                onClick={() => lastUploadedDocId && testEvidenceMutation.mutate({ documentId: lastUploadedDocId })}
                disabled={testEvidenceMutation.isPending || !lastUploadedDocId}
                className="w-full"
              >
                {testEvidenceMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Evidence Mapping...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Test Evidence Mapping
                  </>
                )}
              </Button>

              {testEvidenceMutation.data && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Evidence Mapping Results</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Mappings Created:</span>
                      <Badge variant="default" className="ml-2">{testEvidenceMutation.data.mappingsCreated}</Badge>
                    </div>
                    {testEvidenceMutation.data.mappings && testEvidenceMutation.data.mappings.length > 0 && (
                      <div>
                        <span className="font-medium">Sample Mapping:</span>
                        <div className="mt-1 p-2 bg-white border rounded text-xs">
                          <div>Confidence: {testEvidenceMutation.data.mappings[0].confidence}</div>
                          <div>Quality: {testEvidenceMutation.data.mappings[0].qualityScore}</div>
                          <div>Type: {testEvidenceMutation.data.mappings[0].mappingType}</div>
                          <div>Status: {testEvidenceMutation.data.mappings[0].validationStatus}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {testEvidenceMutation.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">Test Failed</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{testEvidenceMutation.error.message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
