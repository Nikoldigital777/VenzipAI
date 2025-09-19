import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  FileText, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Brain,
  Zap,
  Settings,
  RefreshCw,
  Upload,
  Filter,
  TrendingUp,
  Target,
  MapPin,
  ArrowRight,
  CheckSquare,
  X,
  Clock,
  Star
} from "lucide-react";
import { format } from 'date-fns';

type EvidenceMapping = {
  id: string;
  documentId: string;
  requirementId: string;
  mappingConfidence: string;
  qualityScore: string;
  mappingType: 'direct' | 'partial' | 'supporting' | 'cross_reference';
  evidenceSnippets: any;
  aiAnalysis: any;
  validationStatus: 'pending' | 'validated' | 'rejected' | 'needs_review';
  createdAt: string;
  documentName?: string;
  requirementTitle?: string;
  frameworkId?: string;
};

type EvidenceGap = {
  id: string;
  requirementId: string;
  gapType: 'missing_evidence' | 'insufficient_evidence' | 'outdated_evidence' | 'poor_quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendedActions: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  requirementTitle?: string;
  frameworkId?: string;
};

type Document = {
  id: string;
  fileName: string;
  fileType: string;
  status: string;
  uploadedAt: string;
};

export default function EvidenceMappingDashboard() {
  const { toast } = useToast();
  const [selectedFramework, setSelectedFramework] = useState<string | undefined>();
  const [mappingFilter, setMappingFilter] = useState<string>('all');
  const [gapFilter, setGapFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch evidence mappings
  const { data: mappings, isLoading: mappingsLoading, refetch: refetchMappings } = useQuery<EvidenceMapping[]>({
    queryKey: ["/api/evidence/mappings", selectedFramework, mappingFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedFramework) params.set("framework", selectedFramework);
      if (mappingFilter !== 'all') params.set("status", mappingFilter);
      const res = await apiRequest("GET", `/api/evidence/mappings?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load evidence mappings");
      return res.json();
    },
  });

  // Fetch evidence gaps
  const { data: gaps, isLoading: gapsLoading, refetch: refetchGaps } = useQuery<EvidenceGap[]>({
    queryKey: ["/api/evidence/gaps", selectedFramework, gapFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedFramework) params.set("framework", selectedFramework);
      if (gapFilter !== 'all') params.set("status", gapFilter);
      const res = await apiRequest("GET", `/api/evidence/gaps?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load evidence gaps");
      return res.json();
    },
  });

  // Fetch documents for analysis
  const { data: documentsResponse } = useQuery<{items: Document[]}>({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/documents");
      if (!res.ok) throw new Error("Failed to load documents");
      return res.json();
    },
  });
  
  const documents = documentsResponse?.items || [];

  // Analyze document mutation
  const analyzeDocumentMutation = useMutation({
    mutationFn: async ({ documentId, frameworkId }: { documentId: string; frameworkId?: string }) => {
      const res = await apiRequest("POST", "/api/evidence/analyze", { documentId, frameworkId });
      if (!res.ok) throw new Error("Failed to analyze document");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence/mappings"] });
      toast({
        title: "Analysis Complete",
        description: "Document has been analyzed and mapped to compliance requirements.",
      });
    },
  });

  // Validate mapping mutation
  const validateMappingMutation = useMutation({
    mutationFn: async ({ mappingId, status }: { mappingId: string; status: 'validated' | 'rejected' }) => {
      const res = await apiRequest("PUT", `/api/evidence/mappings/${mappingId}/validate`, { status });
      if (!res.ok) throw new Error("Failed to validate mapping");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence/mappings"] });
      toast({
        title: "Mapping Updated",
        description: "Evidence mapping validation status has been updated.",
      });
    },
  });

  // Identify gaps mutation
  const identifyGapsMutation = useMutation({
    mutationFn: async (frameworkId?: string) => {
      const res = await apiRequest("POST", "/api/evidence/identify-gaps", { frameworkId });
      if (!res.ok) throw new Error("Failed to identify gaps");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence/gaps"] });
      toast({
        title: "Gap Analysis Complete",
        description: "Compliance gaps have been identified and analyzed.",
      });
    },
  });

  const getMappingTypeColor = (type: string) => {
    switch (type) {
      case 'direct': return 'bg-green-100 text-green-800 border-green-300';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'supporting': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cross_reference': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getValidationStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs_review': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getQualityStars = (score: number) => {
    const stars = Math.round(score * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  // Mock data for demonstration
  const mockMappings: EvidenceMapping[] = mappings || [
    {
      id: '1',
      documentId: 'doc1',
      requirementId: 'req1',
      mappingConfidence: '0.85',
      qualityScore: '0.75',
      mappingType: 'direct',
      evidenceSnippets: { snippets: ['Access control policies are documented and reviewed annually'] },
      aiAnalysis: { summary: 'Strong evidence for access control requirements' },
      validationStatus: 'pending',
      createdAt: new Date().toISOString(),
      documentName: 'Security Policy v2.1.pdf',
      requirementTitle: 'Access Control Management',
      frameworkId: 'ISO27001'
    },
    {
      id: '2',
      documentId: 'doc2',
      requirementId: 'req2',
      mappingConfidence: '0.65',
      qualityScore: '0.60',
      mappingType: 'partial',
      evidenceSnippets: { snippets: ['Employee training conducted quarterly'] },
      aiAnalysis: { summary: 'Partial evidence for training requirements' },
      validationStatus: 'needs_review',
      createdAt: new Date().toISOString(),
      documentName: 'Training Schedule 2024.xlsx',
      requirementTitle: 'Security Awareness Training',
      frameworkId: 'SOC2'
    }
  ];

  const mockGaps: EvidenceGap[] = gaps || [
    {
      id: '1',
      requirementId: 'req3',
      gapType: 'missing_evidence',
      severity: 'high',
      description: 'No evidence found for incident response procedures',
      recommendedActions: ['Create incident response plan', 'Document procedures', 'Train staff'],
      status: 'open',
      requirementTitle: 'Incident Response Planning',
      frameworkId: 'ISO27001'
    },
    {
      id: '2',
      requirementId: 'req4',
      gapType: 'insufficient_evidence',
      severity: 'medium',
      description: 'Backup procedures documentation is incomplete',
      recommendedActions: ['Update backup documentation', 'Test recovery procedures'],
      status: 'in_progress',
      requirementTitle: 'Data Backup & Recovery',
      frameworkId: 'SOC2'
    }
  ];

  const filteredMappings = mockMappings.filter(mapping => {
    if (mappingFilter !== 'all' && mapping.validationStatus !== mappingFilter) return false;
    if (searchQuery && !mapping.documentName?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !mapping.requirementTitle?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredGaps = mockGaps.filter(gap => {
    if (gapFilter !== 'all' && gap.status !== gapFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Evidence Mapping Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300">AI-powered document mapping to compliance requirements</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => identifyGapsMutation.mutate(selectedFramework)}
            disabled={identifyGapsMutation.isPending}
            variant="outline"
          >
            <Search className="h-4 w-4 mr-2" />
            Identify Gaps
          </Button>
          <Button
            onClick={() => {
              refetchMappings();
              refetchGaps();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Mappings</p>
                <p className="text-xl font-bold text-blue-600">{mockMappings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Validated</p>
                <p className="text-xl font-bold text-green-600">
                  {mockMappings.filter(m => m.validationStatus === 'validated').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Critical Gaps</p>
                <p className="text-xl font-bold text-red-600">
                  {mockGaps.filter(g => g.severity === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Quality</p>
                <p className="text-xl font-bold text-purple-600">
                  {(mockMappings.reduce((sum, m) => sum + parseFloat(m.qualityScore), 0) / Math.max(mockMappings.length, 1) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cross-Framework Coverage Overview */}
      <Card className="glass-card border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-venzip-primary to-venzip-accent rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Cross-Framework Evidence Coverage</CardTitle>
                <CardDescription>How your documents map across compliance frameworks</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Framework Coverage Grid */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Target className="h-4 w-4 text-venzip-primary" />
                Framework Coverage
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {['SOC2', 'ISO27001', 'HIPAA', 'GDPR'].map((framework, index) => {
                  const frameworkMappings = mockMappings.filter(m => m.frameworkId === framework);
                  const validatedCount = frameworkMappings.filter(m => m.validationStatus === 'validated').length;
                  const totalRequirements = 45; // Mock total requirements per framework
                  const coverage = Math.round((validatedCount / totalRequirements) * 100);
                  const colors = ['from-blue-500 to-blue-600', 'from-green-500 to-green-600', 'from-purple-500 to-purple-600', 'from-orange-500 to-orange-600'];
                  
                  return (
                    <div key={framework} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{framework}</span>
                        <Badge className={`bg-gradient-to-r ${colors[index]} text-white border-0`}>
                          {coverage}%
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className={`bg-gradient-to-r ${colors[index]} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${coverage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {validatedCount} of {totalRequirements} requirements
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Multi-Framework Documents */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-venzip-accent" />
                Multi-Framework Documents
              </h4>
              <div className="space-y-3">
                {/* Group mappings by document to show cross-framework coverage */}
                {(() => {
                  const documentGroups = mockMappings.reduce((groups, mapping) => {
                    const docId = mapping.documentId;
                    if (!groups[docId]) {
                      groups[docId] = {
                        documentName: mapping.documentName || 'Unknown Document',
                        mappings: []
                      };
                    }
                    groups[docId].mappings.push(mapping);
                    return groups;
                  }, {} as Record<string, { documentName: string; mappings: EvidenceMapping[] }>);

                  return Object.values(documentGroups)
                    .filter(group => group.mappings.length > 1) // Only show multi-framework docs
                    .slice(0, 3)
                    .map((group, index) => {
                      const frameworks = Array.from(new Set(group.mappings.map(m => m.frameworkId).filter(Boolean)));
                      const validatedMappings = group.mappings.filter(m => m.validationStatus === 'validated').length;
                      
                      return (
                        <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-venzip-secondary" />
                              <span className="font-medium text-gray-900 text-sm truncate">
                                {group.documentName}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {group.mappings.length} mappings
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {frameworks.map((framework, fIndex) => (
                              <Badge key={fIndex} variant="secondary" className="text-xs px-2 py-0.5">
                                {framework}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {validatedMappings} validated of {group.mappings.length} mappings
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
              {Object.values(mockMappings.reduce((groups, mapping) => {
                const docId = mapping.documentId;
                if (!groups[docId]) groups[docId] = [];
                groups[docId].push(mapping);
                return groups;
              }, {} as Record<string, EvidenceMapping[]>)).filter(group => group.length > 1).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p>No multi-framework documents yet</p>
                  <p className="text-sm">Upload documents to see cross-framework mapping</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents for Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Document Analysis
          </CardTitle>
          <CardDescription>Analyze documents against compliance requirements using AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(documents || []).slice(0, 3).map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">{doc.fileName}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Uploaded {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                </p>
                <Button
                  size="sm"
                  onClick={() => analyzeDocumentMutation.mutate({ 
                    documentId: doc.id, 
                    frameworkId: selectedFramework 
                  })}
                  disabled={analyzeDocumentMutation.isPending}
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evidence Mappings */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Evidence Mappings</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search mappings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={mappingFilter} onValueChange={setMappingFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="needs_review">Needs Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document & Framework</TableHead>
                <TableHead>Requirement</TableHead>
                <TableHead>Cross-Framework</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMappings.map((mapping) => {
                const docMappings = mockMappings.filter(m => m.documentId === mapping.documentId);
                const frameworks = Array.from(new Set(docMappings.map(m => m.frameworkId).filter(Boolean)));
                const frameworkColors: Record<string, string> = { 
                  SOC2: 'bg-blue-100 text-blue-800', 
                  ISO27001: 'bg-green-100 text-green-800', 
                  HIPAA: 'bg-purple-100 text-purple-800', 
                  GDPR: 'bg-orange-100 text-orange-800' 
                };
                
                return (
                  <TableRow key={mapping.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium mb-1 flex items-center gap-2">
                          {mapping.isPolicyDocument || (mapping.documentName?.includes('.pdf') && mapping.documentName?.includes('Policy')) ? (
                            <FileText className="h-4 w-4 text-green-600" />
                          ) : (
                            <FileText className="h-4 w-4 text-gray-400" />
                          )}
                          {mapping.documentName}
                          {(mapping.isPolicyDocument || (mapping.documentName?.includes('.pdf') && mapping.documentName?.includes('Policy'))) && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Generated Policy
                            </Badge>
                          )}
                          {mapping.documentType && (
                            <Badge variant="outline" className="text-xs">
                              {mapping.documentType}
                            </Badge>
                          )}
                        </div>
                        <Badge className={`text-xs ${frameworkColors[mapping.frameworkId || ''] || 'bg-gray-100 text-gray-800'}`}>
                          {mapping.frameworkId}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium text-sm">{mapping.requirementTitle}</div>
                        {mapping.evidenceSnippets?.snippets?.[0] && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            "{mapping.evidenceSnippets.snippets[0]}"
                          </div>
                        )}
                        {/* Show suggested evidence if available */}
                        {mapping.suggestedEvidence && mapping.suggestedEvidence.length > 0 && (
                          <div className="mt-2 text-xs">
                            <div className="text-blue-600 font-medium">Suggested Evidence:</div>
                            <ul className="list-disc list-inside text-gray-500 ml-2">
                              {mapping.suggestedEvidence.slice(0, 2).map((evidence, idx) => (
                                <li key={idx} className="truncate">{evidence}</li>
                              ))}
                              {mapping.suggestedEvidence.length > 2 && (
                                <li className="text-blue-500">+{mapping.suggestedEvidence.length - 2} more</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {frameworks.length > 1 ? (
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <MapPin className="h-3 w-3 text-venzip-primary" />
                              <span className="text-xs font-medium text-venzip-primary">{frameworks.length} frameworks</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {frameworks.slice(0, 3).map((fw, idx) => (
                                <Badge key={idx} className={`text-xs px-1.5 py-0.5 ${fw ? frameworkColors[fw] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {fw}
                                </Badge>
                              ))}
                              {frameworks.length > 3 && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                  +{frameworks.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Single framework</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getMappingTypeColor(mapping.mappingType)}>
                        {mapping.mappingType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getQualityStars(parseFloat(mapping.qualityScore))}
                        <span className="text-xs text-gray-500 ml-1">
                          {(parseFloat(mapping.mappingConfidence) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getValidationStatusColor(mapping.validationStatus)}>
                        {mapping.validationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => validateMappingMutation.mutate({ 
                            mappingId: mapping.id, 
                            status: 'validated' 
                          })}
                        >
                          <CheckSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => validateMappingMutation.mutate({ 
                            mappingId: mapping.id, 
                            status: 'rejected' 
                          })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Evidence Gaps */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Evidence Gaps
            </CardTitle>
            <Select value={gapFilter} onValueChange={setGapFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredGaps.map((gap) => (
              <div key={gap.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className={getSeverityColor(gap.severity)}>
                      {gap.severity}
                    </Badge>
                    <div>
                      <h4 className="font-medium">{gap.requirementTitle}</h4>
                      <p className="text-sm text-gray-600">{gap.frameworkId}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {gap.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{gap.description}</p>
                
                <div>
                  <p className="text-sm font-medium mb-2">Recommended Actions:</p>
                  <ul className="space-y-1">
                    {gap.recommendedActions.map((action, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}