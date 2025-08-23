import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Risk } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import AIChat from "@/components/ai-chat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RiskFormData {
  title: string;
  description: string;
  category: string;
  frameworkId: string;
  impact: string;
  likelihood: string;
  owner: string;
  dueDate: string;
}

export default function Risks() {
  const { toast } = useToast();
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [riskForm, setRiskForm] = useState<RiskFormData>({
    title: "",
    description: "",
    category: "",
    frameworkId: "",
    impact: "",
    likelihood: "",
    owner: "",
    dueDate: ""
  });

  // Fetch risks
  const { data: risks = [], isLoading } = useQuery<Risk[]>({
    queryKey: ["/api/risks"],
  });

  // Create risk mutation
  const createRiskMutation = useMutation({
    mutationFn: async (data: RiskFormData) => {
      // Calculate risk score based on impact and likelihood
      const impactScore = data.impact === 'high' ? 3 : data.impact === 'medium' ? 2 : 1;
      const likelihoodScore = data.likelihood === 'high' ? 3 : data.likelihood === 'medium' ? 2 : 1;
      const riskScore = (impactScore * likelihoodScore).toString();
      
      const response = await apiRequest("POST", "/api/risks", {
        ...data,
        riskScore,
        status: 'open'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      setShowAddRisk(false);
      setRiskForm({
        title: "",
        description: "",
        category: "",
        frameworkId: "",
        impact: "",
        likelihood: "",
        owner: "",
        dueDate: ""
      });
      toast({
        title: "Success",
        description: "Risk added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create risk",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRiskMutation.mutate(riskForm);
  };

  const getRiskColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-danger-coral';
      case 'medium': return 'border-warning-orange';
      case 'low': return 'border-success-green';
      default: return 'border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-danger-coral/20 text-danger-coral';
      case 'medium': return 'bg-warning-orange/20 text-warning-orange';
      case 'low': return 'bg-success-green/20 text-success-green';
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

  const getRiskScoreColor = (score: number) => {
    if (score >= 7) return 'text-danger-coral';
    if (score >= 4) return 'text-warning-orange';
    return 'text-success-green';
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'No due date';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Risk summary calculations
  const highRisks = risks.filter((risk) => risk.impact === 'high').length;
  const mediumRisks = risks.filter((risk) => risk.impact === 'medium').length;
  const lowRisks = risks.filter((risk) => risk.impact === 'low').length;

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
          <div className="glass-card p-8 rounded-2xl">
            <div className="w-8 h-8 border-4 border-venzip-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading risks...</p>
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
          
          {/* Risks Header */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Risk Register</h1>
                  <p className="text-gray-600">Identify, assess, and manage compliance risks</p>
                </div>
                <Dialog open={showAddRisk} onOpenChange={setShowAddRisk}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-primary text-white hover:shadow-lg transition-all duration-200" data-testid="button-add-risk">
                      <i className="fas fa-plus mr-2"></i>Add Risk
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Risk</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Risk Title</Label>
                          <Input
                            id="title"
                            value={riskForm.title}
                            onChange={(e) => setRiskForm(prev => ({ ...prev, title: e.target.value }))}
                            required
                            data-testid="input-risk-title"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            value={riskForm.category}
                            onChange={(e) => setRiskForm(prev => ({ ...prev, category: e.target.value }))}
                            placeholder="e.g., Data Security, Access Control"
                            required
                            data-testid="input-risk-category"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={riskForm.description}
                          onChange={(e) => setRiskForm(prev => ({ ...prev, description: e.target.value }))}
                          required
                          data-testid="textarea-risk-description"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="framework">Framework</Label>
                          <Select value={riskForm.frameworkId} onValueChange={(value) => setRiskForm(prev => ({ ...prev, frameworkId: value }))}>
                            <SelectTrigger data-testid="select-framework">
                              <SelectValue placeholder="Select framework" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="soc2">SOC 2</SelectItem>
                              <SelectItem value="iso27001">ISO 27001</SelectItem>
                              <SelectItem value="hipaa">HIPAA</SelectItem>
                              <SelectItem value="gdpr">GDPR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="impact">Impact</Label>
                          <Select value={riskForm.impact} onValueChange={(value) => setRiskForm(prev => ({ ...prev, impact: value }))}>
                            <SelectTrigger data-testid="select-impact">
                              <SelectValue placeholder="Select impact" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="likelihood">Likelihood</Label>
                          <Select value={riskForm.likelihood} onValueChange={(value) => setRiskForm(prev => ({ ...prev, likelihood: value }))}>
                            <SelectTrigger data-testid="select-likelihood">
                              <SelectValue placeholder="Select likelihood" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="owner">Risk Owner</Label>
                          <Input
                            id="owner"
                            value={riskForm.owner}
                            onChange={(e) => setRiskForm(prev => ({ ...prev, owner: e.target.value }))}
                            placeholder="Person responsible"
                            data-testid="input-risk-owner"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={riskForm.dueDate}
                            onChange={(e) => setRiskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                            data-testid="input-due-date"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowAddRisk(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createRiskMutation.isPending} data-testid="button-submit-risk">
                          {createRiskMutation.isPending ? "Adding..." : "Add Risk"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Risk Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card hover-lift" data-testid="summary-high-risk">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-danger-coral/10 rounded-full flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-danger-coral text-lg"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{highRisks}</div>
                    <div className="text-sm text-gray-500">High Risk</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover-lift" data-testid="summary-medium-risk">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-warning-orange/10 rounded-full flex items-center justify-center">
                    <i className="fas fa-exclamation-circle text-warning-orange text-lg"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{mediumRisks}</div>
                    <div className="text-sm text-gray-500">Medium Risk</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover-lift" data-testid="summary-low-risk">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-success-green/10 rounded-full flex items-center justify-center">
                    <i className="fas fa-check-circle text-success-green text-lg"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{lowRisks}</div>
                    <div className="text-sm text-gray-500">Low Risk</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk List */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Risk Assessment</h2>
              <div className="space-y-4">
                {risks.length === 0 ? (
                  <div className="text-center py-12" data-testid="no-risks">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-exclamation-triangle text-gray-400 text-xl"></i>
                    </div>
                    <p className="text-gray-500">No risks identified yet</p>
                    <p className="text-sm text-gray-400">Add your first risk assessment to get started</p>
                  </div>
                ) : (
                  risks.map((risk) => (
                    <div 
                      key={risk.id} 
                      className={`p-4 bg-white rounded-lg border-l-4 ${getRiskColor(risk.impact)}`}
                      data-testid={`risk-${risk.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{risk.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                          <div className="flex items-center space-x-4 mt-3">
                            <Badge className={getImpactColor(risk.impact)}>
                              {risk.impact.charAt(0).toUpperCase() + risk.impact.slice(1)} Risk
                            </Badge>
                            {risk.frameworkId && (
                              <Badge className={getFrameworkColor(risk.frameworkId)}>
                                {risk.frameworkId.toUpperCase()}
                              </Badge>
                            )}
                            <span className="text-sm text-gray-500">
                              Impact: {risk.impact.charAt(0).toUpperCase() + risk.impact.slice(1)} | 
                              Likelihood: {risk.likelihood.charAt(0).toUpperCase() + risk.likelihood.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className={`text-lg font-bold ${getRiskScoreColor(parseFloat(risk.riskScore))}`}>
                            {parseFloat(risk.riskScore).toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">Risk Score</div>
                        </div>
                      </div>
                      {risk.mitigation && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-700">
                            <strong>Mitigation:</strong> {risk.mitigation}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {risk.owner && `Owner: ${risk.owner}`}
                            {risk.owner && risk.dueDate && ' | '}
                            {risk.dueDate && `Due: ${formatDate(risk.dueDate)}`}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
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
