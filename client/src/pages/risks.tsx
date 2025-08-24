import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import AIChat from "@/components/ai-chat";
import DynamicRiskDashboard from "@/components/dynamic-risk-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Plus,
  Loader2,
  Search,
  RefreshCw
} from "lucide-react";

type Risk = {
  id: string;
  frameworkId: string | null;
  title: string;
  description: string;
  category: string;
  impact: "low" | "medium" | "high";
  likelihood: "low" | "medium" | "high";
  riskScore: string;
  mitigation: string | null;
  owner: string | null;
  dueDate: string | null;
  status: "open" | "mitigated" | "closed";
  createdAt: string;
  updatedAt: string;
};

type ListResp<T> = { items: T[]; total: number };

const CATEGORIES = ["operational", "technical", "compliance", "financial", "legal"];
const IMPACTS = ["low", "medium", "high"] as const;
const LIKELIHOODS = ["low", "medium", "high"] as const;
const STATUSES = ["open", "mitigated", "closed"] as const;
const FRAMEWORKS = ["soc2", "iso27001", "hipaa", "gdpr"];

export default function RisksPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'risks' | 'dashboard'>('risks');
  
  // filters
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [impact, setImpact] = useState<string | undefined>();
  const [likelihood, setLikelihood] = useState<string | undefined>();

  // list
  const { data, isLoading, refetch } = useQuery<ListResp<Risk>>({
    queryKey: ["/api/risks", { q, category, impact, likelihood }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category) params.set("category", category);
      if (impact) params.set("impact", impact);
      if (likelihood) params.set("likelihood", likelihood);
      const res = await apiRequest("GET", `/api/risks?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load risks");
      return res.json();
    },
  });

  // create / update / delete mutations
  const createMutation = useMutation({
    mutationFn: async (body: Partial<Risk>) => {
      const res = await apiRequest("POST", "/api/risks", body);
      if (!res.ok) throw new Error("Create failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      toast({
        title: "Success",
        description: "Risk created successfully",
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<Risk> }) => {
      const res = await apiRequest("PUT", `/api/risks/${id}`, body);
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      toast({
        title: "Success",
        description: "Risk updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update risk",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/risks/${id}`);
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      toast({
        title: "Success",
        description: "Risk deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete risk",
        variant: "destructive",
      });
    },
  });

  // new risk form state
  const [open, setOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [draft, setDraft] = useState<Partial<Risk>>({
    frameworkId: "soc2",
    title: "",
    description: "",
    category: "operational",
    impact: "medium",
    likelihood: "medium",
    mitigation: "",
    owner: "",
    dueDate: "",
    status: "open",
  });

  const onCreate = async () => {
    await createMutation.mutateAsync({
      frameworkId: draft.frameworkId!,
      title: draft.title!,
      description: draft.description!,
      category: draft.category!,
      impact: draft.impact ?? "medium",
      likelihood: draft.likelihood ?? "medium",
      mitigation: draft.mitigation || null,
      owner: draft.owner || null,
      dueDate: draft.dueDate || null,
      status: draft.status ?? "open",
    });
    setOpen(false);
    setDraft({ 
      frameworkId: "soc2", 
      title: "", 
      description: "", 
      category: "operational", 
      impact: "medium", 
      likelihood: "medium", 
      mitigation: "", 
      owner: "", 
      dueDate: "", 
      status: "open" 
    });
  };

  const onUpdate = async () => {
    if (!editingRisk) return;
    await updateMutation.mutateAsync({
      id: editingRisk.id,
      body: {
        frameworkId: draft.frameworkId!,
        title: draft.title!,
        description: draft.description!,
        category: draft.category!,
        impact: draft.impact ?? "medium",
        likelihood: draft.likelihood ?? "medium",
        mitigation: draft.mitigation || null,
        owner: draft.owner || null,
        dueDate: draft.dueDate || null,
        status: draft.status ?? "open",
      }
    });
    setEditingRisk(null);
    setDraft({ 
      frameworkId: "soc2", 
      title: "", 
      description: "", 
      category: "operational", 
      impact: "medium", 
      likelihood: "medium", 
      mitigation: "", 
      owner: "", 
      dueDate: "", 
      status: "open" 
    });
  };

  const openEditDialog = (risk: Risk) => {
    setEditingRisk(risk);
    setDraft({
      frameworkId: risk.frameworkId || "soc2",
      title: risk.title,
      description: risk.description,
      category: risk.category,
      impact: risk.impact,
      likelihood: risk.likelihood,
      mitigation: risk.mitigation || "",
      owner: risk.owner || "",
      dueDate: risk.dueDate ? new Date(risk.dueDate).toISOString().split('T')[0] : "",
      status: risk.status,
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-danger-coral/20 text-danger-coral';
      case 'medium': return 'bg-warning-orange/20 text-warning-orange';
      case 'low': return 'bg-success-green/20 text-success-green';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case 'high': return 'bg-danger-coral/20 text-danger-coral';
      case 'medium': return 'bg-warning-orange/20 text-warning-orange';
      case 'low': return 'bg-success-green/20 text-success-green';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed': return 'bg-success-green/20 text-success-green';
      case 'mitigated': return 'bg-venzip-primary/20 text-venzip-primary';
      case 'open': return 'bg-danger-coral/20 text-danger-coral';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 7) return 'text-danger-coral font-bold';
    if (score >= 4) return 'text-warning-orange font-semibold';
    return 'text-success-green';
  };

  // Risk summary calculations
  const risks = data?.items ?? [];
  const highRisks = risks.filter((risk) => risk.impact === 'high').length;
  const mediumRisks = risks.filter((risk) => risk.impact === 'medium').length;
  const lowRisks = risks.filter((risk) => risk.impact === 'low').length;

  return (
    <>
      <Navigation />
      <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50/80 via-white/50 to-venzip-primary/5 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-danger-coral/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-warning-orange/10 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-venzip-primary/8 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          {/* Enhanced Header Section */}
          <div className="mb-12 text-center animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Risk <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero animate-gradient-x">Management</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Identify, assess, and mitigate compliance risks with AI-powered insights
            </p>
          </div>
          
          {/* Enhanced Tab Navigation */}
          <div className="flex justify-center mb-8 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <div className="flex space-x-2 glass-card p-2 rounded-2xl border-0 shadow-xl">
              <button
                onClick={() => setActiveTab('risks')}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'risks'
                    ? 'bg-gradient-primary text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-venzip-primary hover:bg-venzip-primary/10'
                }`}
                data-testid="tab-risks"
              >
                <AlertTriangle className="h-4 w-4" />
                Risk Management
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-primary text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-venzip-primary hover:bg-venzip-primary/10'
                }`}
                data-testid="tab-dashboard"
              >
                <CheckCircle className="h-4 w-4" />
                AI Risk Dashboard
              </button>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'dashboard' ? (
            <DynamicRiskDashboard />
          ) : (
            <>
              {/* Enhanced Risk Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <Card className="glass-card hover-lift group relative overflow-hidden animate-fadeInUp" style={{animationDelay: '0.3s'}} data-testid="summary-high-risk">
              <div className="absolute inset-0 bg-gradient-to-br from-danger-coral/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-danger-coral/20 to-danger-coral/10 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg animate-glow-pulse">
                    <AlertTriangle className="h-8 w-8 text-danger-coral group-hover:animate-pulse" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 group-hover:text-danger-coral transition-colors duration-300">{highRisks}</div>
                    <div className="text-sm text-gray-500 font-medium">High Risk Items</div>
                    <div className="text-xs text-gray-400 mt-1">Require immediate attention</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover-lift group relative overflow-hidden animate-fadeInUp" style={{animationDelay: '0.4s'}} data-testid="summary-medium-risk">
              <div className="absolute inset-0 bg-gradient-to-br from-warning-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-warning-orange/20 to-warning-orange/10 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                    <AlertCircle className="h-8 w-8 text-warning-orange group-hover:animate-bounce" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 group-hover:text-warning-orange transition-colors duration-300">{mediumRisks}</div>
                    <div className="text-sm text-gray-500 font-medium">Medium Risk Items</div>
                    <div className="text-xs text-gray-400 mt-1">Monitor and mitigate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover-lift group relative overflow-hidden animate-fadeInUp" style={{animationDelay: '0.5s'}} data-testid="summary-low-risk">
              <div className="absolute inset-0 bg-gradient-to-br from-success-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-success-green/20 to-success-green/10 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                    <CheckCircle className="h-8 w-8 text-success-green group-hover:animate-pulse" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 group-hover:text-success-green transition-colors duration-300">{lowRisks}</div>
                    <div className="text-sm text-gray-500 font-medium">Low Risk Items</div>
                    <div className="text-xs text-gray-400 mt-1">Manageable impact</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Filters */}
          <Card className="glass-card group hover-lift animate-fadeInUp" style={{animationDelay: '0.6s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="w-10 h-10 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-2xl flex items-center justify-center">
                  <Search className="h-5 w-5 text-venzip-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold">Risk Filters</div>
                  <div className="text-sm text-gray-500 font-normal">Search and filter your risk portfolio</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search risks..." 
                  value={q} 
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-10 glass-card border-0 shadow-sm"
                  data-testid="search-risks"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="glass-card border-0 shadow-sm" data-testid="filter-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={impact} onValueChange={setImpact}>
                <SelectTrigger className="glass-card border-0 shadow-sm" data-testid="filter-impact">
                  <SelectValue placeholder="Impact" />
                </SelectTrigger>
                <SelectContent>
                  {IMPACTS.map(i => (
                    <SelectItem key={i} value={i}>
                      {i.charAt(0).toUpperCase() + i.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={likelihood} onValueChange={setLikelihood}>
                <SelectTrigger className="glass-card border-0 shadow-sm" data-testid="filter-likelihood">
                  <SelectValue placeholder="Likelihood" />
                </SelectTrigger>
                <SelectContent>
                  {LIKELIHOODS.map(l => (
                    <SelectItem key={l} value={l}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={() => refetch()} data-testid="apply-filters" className="bg-gradient-primary text-white hover:shadow-lg hover:shadow-venzip-primary/25 hover:-translate-y-1 transform transition-all duration-300 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Apply
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setQ(""); 
                    setCategory(undefined); 
                    setImpact(undefined); 
                    setLikelihood(undefined); 
                  }}
                  className="glass-card border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300"
                  data-testid="reset-filters"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Actions */}
          <div className="flex justify-end animate-fadeInUp" style={{animationDelay: '0.7s'}}>
            <Dialog open={open || !!editingRisk} onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(false);
                setEditingRisk(null);
                setDraft({ 
                  frameworkId: "soc2", 
                  title: "", 
                  description: "", 
                  category: "operational", 
                  impact: "medium", 
                  likelihood: "medium", 
                  mitigation: "", 
                  owner: "", 
                  dueDate: "", 
                  status: "open" 
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-primary text-white hover:shadow-lg hover:shadow-venzip-primary/25 hover:-translate-y-1 transform transition-all duration-300 flex items-center gap-2 px-6 py-3 rounded-xl font-medium group"
                  onClick={() => setOpen(true)}
                  data-testid="new-risk-button"
                >
                  <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                  New Risk
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingRisk ? 'Edit Risk' : 'Create Risk'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="framework">Framework</Label>
                      <Select value={draft.frameworkId || undefined} onValueChange={(v) => setDraft(d => ({ ...d, frameworkId: v }))}>
                        <SelectTrigger data-testid="risk-framework">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FRAMEWORKS.map(f => (
                            <SelectItem key={f} value={f}>
                              {f.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={draft.category} onValueChange={(v) => setDraft(d => ({ ...d, category: v }))}>
                        <SelectTrigger data-testid="risk-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => (
                            <SelectItem key={c} value={c}>
                              {c.charAt(0).toUpperCase() + c.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      placeholder="Risk title" 
                      value={draft.title ?? ""} 
                      onChange={(e) => setDraft(d => ({ ...d, title: e.target.value }))}
                      data-testid="risk-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      placeholder="Risk description" 
                      value={draft.description ?? ""} 
                      onChange={(e) => setDraft(d => ({ ...d, description: e.target.value }))}
                      data-testid="risk-description"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="impact">Impact</Label>
                      <Select value={draft.impact} onValueChange={(v) => setDraft(d => ({ ...d, impact: v as any }))}>
                        <SelectTrigger data-testid="risk-impact">
                          <SelectValue placeholder="Impact" />
                        </SelectTrigger>
                        <SelectContent>
                          {IMPACTS.map(i => (
                            <SelectItem key={i} value={i}>
                              {i.charAt(0).toUpperCase() + i.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="likelihood">Likelihood</Label>
                      <Select value={draft.likelihood} onValueChange={(v) => setDraft(d => ({ ...d, likelihood: v as any }))}>
                        <SelectTrigger data-testid="risk-likelihood">
                          <SelectValue placeholder="Likelihood" />
                        </SelectTrigger>
                        <SelectContent>
                          {LIKELIHOODS.map(l => (
                            <SelectItem key={l} value={l}>
                              {l.charAt(0).toUpperCase() + l.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={draft.status} onValueChange={(v) => setDraft(d => ({ ...d, status: v as any }))}>
                        <SelectTrigger data-testid="risk-status">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => (
                            <SelectItem key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="mitigation">Mitigation</Label>
                    <Textarea 
                      placeholder="Mitigation strategy" 
                      value={draft.mitigation ?? ""} 
                      onChange={(e) => setDraft(d => ({ ...d, mitigation: e.target.value }))}
                      data-testid="risk-mitigation"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="owner">Owner</Label>
                      <Input 
                        placeholder="Person responsible" 
                        value={draft.owner ?? ""} 
                        onChange={(e) => setDraft(d => ({ ...d, owner: e.target.value }))}
                        data-testid="risk-owner"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input 
                        type="date" 
                        value={draft.dueDate ?? ""} 
                        onChange={(e) => setDraft(d => ({ ...d, dueDate: e.target.value }))}
                        data-testid="risk-due-date"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setOpen(false);
                        setEditingRisk(null);
                        setDraft({ 
                          frameworkId: "soc2", 
                          title: "", 
                          description: "", 
                          category: "operational", 
                          impact: "medium", 
                          likelihood: "medium", 
                          mitigation: "", 
                          owner: "", 
                          dueDate: "", 
                          status: "open" 
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={editingRisk ? onUpdate : onCreate} 
                      disabled={!Boolean(draft.title?.trim()) || !Boolean(draft.description?.trim()) || (!editingRisk && createMutation.isPending) || (Boolean(editingRisk) && updateMutation.isPending)}
                      data-testid="save-risk"
                    >
                      {editingRisk ? (updateMutation.isPending ? "Updating..." : "Update") : (createMutation.isPending ? "Creating..." : "Create")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table */}
          <Card className="glass-card">
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-sm text-gray-500 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-venzip-primary" />
                  Loading risks…
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Impact</TableHead>
                      <TableHead>Likelihood</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data?.items ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No risks found
                        </TableCell>
                      </TableRow>
                    ) : (
                      (data?.items ?? []).map((risk) => (
                        <TableRow key={risk.id} data-testid={`risk-row-${risk.id}`}>
                          <TableCell className="font-medium">{risk.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {risk.category.charAt(0).toUpperCase() + risk.category.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getImpactColor(risk.impact)}>
                              {risk.impact.charAt(0).toUpperCase() + risk.impact.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getLikelihoodColor(risk.likelihood)}>
                              {risk.likelihood.charAt(0).toUpperCase() + risk.likelihood.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={getRiskScoreColor(parseFloat(risk.riskScore))}>
                              {parseFloat(risk.riskScore).toFixed(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(risk.status)}>
                              {risk.status.charAt(0).toUpperCase() + risk.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{risk.owner || <span className="text-gray-400">-</span>}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(risk)}
                                data-testid={`edit-risk-${risk.id}`}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteMutation.mutate(risk.id)}
                                disabled={deleteMutation.isPending}
                                data-testid={`delete-risk-${risk.id}`}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
            </>
          )}
        </div>
      </div>
      <AIChat />
    </>
  );
}