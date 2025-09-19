
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download, 
  Eye, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Settings
} from "lucide-react";

type GeneratedPolicy = {
  id: string;
  title: string;
  policyType: string;
  category: string;
  content: string;
  status: string;
  version: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  templateId: string;
  variables?: any;
};

type PolicyTemplate = {
  id: string;
  templateName: string;
  templateType: string;
  category: string;
  title: string;
  description: string;
  frameworkId: string;
  priority: string;
};

interface PoliciesListProps {
  compact?: boolean;
  showGenerateButton?: boolean;
  maxItems?: number;
}

export default function PoliciesList({ compact = false, showGenerateButton = true, maxItems }: PoliciesListProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedPolicyPreview, setSelectedPolicyPreview] = useState<GeneratedPolicy | null>(null);

  // Fetch generated policies
  const { data: policies = [], isLoading: policiesLoading, refetch } = useQuery<GeneratedPolicy[]>({
    queryKey: ["/api/policies/generated"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/policies/generated");
      if (!response.ok) {
        throw new Error("Failed to load policies");
      }
      return response.json();
    },
  });

  // Fetch policy templates
  const { data: templates = [] } = useQuery<PolicyTemplate[]>({
    queryKey: ["/api/policies/templates"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/policies/templates");
      if (!response.ok) {
        throw new Error("Failed to load templates");
      }
      return response.json();
    },
  });

  // Generate policy mutation
  const generatePolicyMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await apiRequest("POST", "/api/policies/generate", {
        templateId,
        customVariables: {}
      });
      if (!response.ok) {
        throw new Error("Failed to generate policy");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Policy Generated",
        description: "Your policy has been successfully generated.",
      });
      refetch();
      setShowGenerateDialog(false);
      setSelectedTemplate("");
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Approve policy mutation
  const approvePolicyMutation = useMutation({
    mutationFn: async (policyId: string) => {
      const response = await apiRequest("PUT", `/api/policies/generated/${policyId}/status`, {
        status: "approved"
      });
      if (!response.ok) {
        throw new Error("Failed to approve policy");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Policy Approved",
        description: "The policy has been approved and is now active.",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'rejected': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'draft': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleDownload = (policy: GeneratedPolicy) => {
    const blob = new Blob([policy.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${policy.title.replace(/\s+/g, '_')}_v${policy.version}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const displayedPolicies = maxItems ? policies.slice(0, maxItems) : policies;

  if (compact) {
    return (
      <div className="space-y-3" data-testid="policies-list-compact">
        {policiesLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-venzip-primary mx-auto"></div>
            <span className="text-sm text-gray-600 mt-2">Loading policies...</span>
          </div>
        ) : displayedPolicies.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No policies generated yet</p>
            {showGenerateButton && (
              <Button
                size="sm"
                className="mt-2"
                onClick={() => setShowGenerateDialog(true)}
                data-testid="generate-policy-button-compact"
              >
                <Plus className="h-3 w-3 mr-1" />
                Generate Policy
              </Button>
            )}
          </div>
        ) : (
          displayedPolicies.map((policy) => (
            <Card key={policy.id} className="glass-card border-0 shadow-sm hover:shadow-md transition-shadow duration-200" data-testid={`policy-item-${policy.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">{policy.title}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>v{policy.version}</span>
                        <span>•</span>
                        <span>{new Date(policy.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(policy.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(policy.status)}
                        {policy.status}
                      </div>
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPolicyPreview(policy)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  return (
    <Card data-testid="policies-list-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generated Policies ({policies.length})
          </span>
          {showGenerateButton && (
            <Button onClick={() => setShowGenerateDialog(true)} data-testid="generate-new-policy-button">
              <Plus className="h-4 w-4 mr-2" />
              Generate New
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {policiesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-venzip-primary mx-auto"></div>
            <span className="text-gray-600 mt-2">Loading policies...</span>
          </div>
        ) : policies.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">No policies have been generated yet</p>
            <p className="text-sm text-gray-400 mb-6">Generate compliance policies based on your selected frameworks</p>
            {showGenerateButton && (
              <Button onClick={() => setShowGenerateDialog(true)} data-testid="generate-first-policy-button">
                <Plus className="h-4 w-4 mr-2" />
                Generate Your First Policy
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" data-testid={`policy-${policy.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white">{policy.title}</h3>
                      
                      {/* Policy Metadata */}
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created {new Date(policy.createdAt).toLocaleDateString()}
                        </span>
                        <span>Version {policy.version}</span>
                        <span className="capitalize">{policy.category}</span>
                        <Badge variant="outline" className={getStatusColor(policy.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(policy.status)}
                            {policy.status}
                          </div>
                        </Badge>
                      </div>

                      {/* Approval Information */}
                      {policy.status === 'approved' && policy.approvedAt && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-800 dark:text-green-300">
                              Approved on {new Date(policy.approvedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Policy Preview */}
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                          {policy.content.substring(0, 200)}...
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedPolicyPreview(policy)}
                      data-testid={`view-policy-${policy.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownload(policy)}
                      data-testid={`download-policy-${policy.id}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {policy.status === 'draft' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => approvePolicyMutation.mutate(policy.id)}
                        disabled={approvePolicyMutation.isPending}
                        data-testid={`approve-policy-${policy.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Generate Policy Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent data-testid="generate-policy-dialog">
          <DialogHeader>
            <DialogTitle>Generate New Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Policy Template</label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger data-testid="select-policy-template">
                  <SelectValue placeholder="Choose a policy template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{template.templateName}</span>
                        <span className="text-xs text-gray-500">{template.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => generatePolicyMutation.mutate(selectedTemplate)}
                disabled={!selectedTemplate || generatePolicyMutation.isPending}
                data-testid="confirm-generate-policy"
              >
                {generatePolicyMutation.isPending ? "Generating..." : "Generate Policy"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Policy Preview Dialog */}
      <Dialog open={!!selectedPolicyPreview} onOpenChange={() => setSelectedPolicyPreview(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]" data-testid="policy-preview-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedPolicyPreview?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPolicyPreview && (
              <>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Version {selectedPolicyPreview.version}</span>
                  <span>•</span>
                  <span>{selectedPolicyPreview.category}</span>
                  <span>•</span>
                  <Badge variant="outline" className={getStatusColor(selectedPolicyPreview.status)}>
                    {selectedPolicyPreview.status}
                  </Badge>
                </div>
                <div className="max-h-96 overflow-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{selectedPolicyPreview.content}</pre>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => handleDownload(selectedPolicyPreview)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  {selectedPolicyPreview.status === 'draft' && (
                    <Button 
                      onClick={() => {
                        approvePolicyMutation.mutate(selectedPolicyPreview.id);
                        setSelectedPolicyPreview(null);
                      }}
                      disabled={approvePolicyMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Policy
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
