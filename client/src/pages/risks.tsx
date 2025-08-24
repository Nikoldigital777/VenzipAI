import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import AIChat from "@/components/ai-chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 py-12 grid gap-6">
          
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

          {/* Filters */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Risks</CardTitle>
            </CardHeader>
            <CardContent className="grid lg:grid-cols-5 gap-3">
              <Input 
                placeholder="Search…" 
                value={q} 
                onChange={(e) => setQ(e.target.value)}
                data-testid="search-risks"
              />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="filter-category">
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
                <SelectTrigger data-testid="filter-impact">
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
                <SelectTrigger data-testid="filter-likelihood">
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
                <Button onClick={() => refetch()} data-testid="apply-filters">Apply</Button>
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setQ(""); 
                    setCategory(undefined); 
                    setImpact(undefined); 
                    setLikelihood(undefined); 
                  }}
                  data-testid="reset-filters"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end">
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
                  className="bg-venzip-primary text-white"
                  onClick={() => setOpen(true)}
                  data-testid="new-risk-button"
                >
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
                      disabled={!Boolean(draft.title?.trim()) || !Boolean(draft.description?.trim()) || (!editingRisk && createMutation.isPending) || (editingRisk && updateMutation.isPending)}
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
                  <div className="w-8 h-8 border-4 border-venzip-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
        </div>
      </div>
      <AIChat />
    </>
  );
}