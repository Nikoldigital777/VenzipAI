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

type Task = {
  id: string;
  frameworkId: string | null;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  assignedTo: string | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ListResp<T> = { items: T[]; total: number };

const PRIORITIES = ["low", "medium", "high"] as const;
const STATUSES = ["pending", "in_progress", "completed"] as const;
const FRAMEWORKS = ["soc2", "iso27001", "hipaa", "gdpr"];

export default function TasksPage() {
  const { toast } = useToast();
  
  // filters
  const [q, setQ] = useState("");
  const [framework, setFramework] = useState<string | undefined>();
  const [priority, setPriority] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();

  // list
  const { data, isLoading, refetch } = useQuery<ListResp<Task>>({
    queryKey: ["/api/tasks", { q, framework, priority, status }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (framework) params.set("framework", framework);
      if (priority) params.set("priority", priority);
      if (status) params.set("status", status);
      const res = await apiRequest("GET", `/api/tasks?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load tasks");
      return res.json();
    },
  });

  // create / update / delete mutations
  const createMutation = useMutation({
    mutationFn: async (body: Partial<Task>) => {
      const res = await apiRequest("POST", "/api/tasks", body);
      if (!res.ok) throw new Error("Create failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<Task> }) => {
      const res = await apiRequest("PUT", `/api/tasks/${id}`, body);
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/tasks/${id}`);
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  // new task form state
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draft, setDraft] = useState<Partial<Task>>({
    frameworkId: "soc2",
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    assignedTo: "",
    dueDate: "",
  });

  const onCreate = async () => {
    await createMutation.mutateAsync({
      frameworkId: draft.frameworkId!,
      title: draft.title!,
      description: draft.description || null,
      priority: draft.priority ?? "medium",
      status: draft.status ?? "pending",
      assignedTo: draft.assignedTo || null,
      dueDate: draft.dueDate || null,
    });
    setOpen(false);
    setDraft({ frameworkId: "soc2", title: "", description: "", priority: "medium", status: "pending", assignedTo: "", dueDate: "" });
  };

  const onUpdate = async () => {
    if (!editingTask) return;
    await updateMutation.mutateAsync({
      id: editingTask.id,
      body: {
        frameworkId: draft.frameworkId!,
        title: draft.title!,
        description: draft.description || null,
        priority: draft.priority ?? "medium",
        status: draft.status ?? "pending",
        assignedTo: draft.assignedTo || null,
        dueDate: draft.dueDate || null,
      }
    });
    setEditingTask(null);
    setDraft({ frameworkId: "soc2", title: "", description: "", priority: "medium", status: "pending", assignedTo: "", dueDate: "" });
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setDraft({
      frameworkId: task.frameworkId || "soc2",
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-danger-coral/20 text-danger-coral';
      case 'medium': return 'bg-warning-orange/20 text-warning-orange';
      case 'low': return 'bg-success-green/20 text-success-green';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success-green/20 text-success-green';
      case 'in_progress': return 'bg-venzip-primary/20 text-venzip-primary';
      case 'pending': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const nextStatus = (currentStatus: string): string => {
    const order = ["pending", "in_progress", "completed"] as const;
    const idx = order.indexOf(currentStatus as any);
    return order[Math.min(order.length - 1, idx + 1)];
  };

  return (
    <>
      <Navigation />
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 py-12 grid gap-6">
          
          {/* Filters */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent className="grid lg:grid-cols-5 gap-3">
              <Input 
                placeholder="Search…" 
                value={q} 
                onChange={(e) => setQ(e.target.value)}
                data-testid="search-tasks"
              />
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger data-testid="filter-framework">
                  <SelectValue placeholder="Framework" />
                </SelectTrigger>
                <SelectContent>
                  {FRAMEWORKS.map(f => (
                    <SelectItem key={f} value={f}>
                      {f.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger data-testid="filter-priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger data-testid="filter-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s}>
                      {s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}
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
                    setFramework(undefined); 
                    setPriority(undefined); 
                    setStatus(undefined); 
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
            <Dialog open={open || !!editingTask} onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(false);
                setEditingTask(null);
                setDraft({ frameworkId: "soc2", title: "", description: "", priority: "medium", status: "pending", assignedTo: "", dueDate: "" });
              }
            }}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-venzip-primary text-white"
                  onClick={() => setOpen(true)}
                  data-testid="new-task-button"
                >
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="framework">Framework</Label>
                    <Select value={draft.frameworkId} onValueChange={(v) => setDraft(d => ({ ...d, frameworkId: v }))}>
                      <SelectTrigger data-testid="task-framework">
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
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      placeholder="Task title" 
                      value={draft.title ?? ""} 
                      onChange={(e) => setDraft(d => ({ ...d, title: e.target.value }))}
                      data-testid="task-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      placeholder="Task description" 
                      value={draft.description ?? ""} 
                      onChange={(e) => setDraft(d => ({ ...d, description: e.target.value }))}
                      data-testid="task-description"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={draft.priority} onValueChange={(v) => setDraft(d => ({ ...d, priority: v as any }))}>
                        <SelectTrigger data-testid="task-priority">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITIES.map(p => (
                            <SelectItem key={p} value={p}>
                              {p.charAt(0).toUpperCase() + p.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={draft.status} onValueChange={(v) => setDraft(d => ({ ...d, status: v as any }))}>
                        <SelectTrigger data-testid="task-status">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => (
                            <SelectItem key={s} value={s}>
                              {s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input 
                        type="date" 
                        value={draft.dueDate ?? ""} 
                        onChange={(e) => setDraft(d => ({ ...d, dueDate: e.target.value }))}
                        data-testid="task-due-date"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input 
                      placeholder="Person responsible" 
                      value={draft.assignedTo ?? ""} 
                      onChange={(e) => setDraft(d => ({ ...d, assignedTo: e.target.value }))}
                      data-testid="task-assigned-to"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setOpen(false);
                        setEditingTask(null);
                        setDraft({ frameworkId: "soc2", title: "", description: "", priority: "medium", status: "pending", assignedTo: "", dueDate: "" });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={editingTask ? onUpdate : onCreate} 
                      disabled={!draft.title || (!editingTask && createMutation.isPending) || (editingTask && updateMutation.isPending)}
                      data-testid="save-task"
                    >
                      {editingTask ? (updateMutation.isPending ? "Updating..." : "Update") : (createMutation.isPending ? "Creating..." : "Create")}
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
                  Loading tasks…
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Framework</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data?.items ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No tasks found
                        </TableCell>
                      </TableRow>
                    ) : (
                      (data?.items ?? []).map((task) => (
                        <TableRow key={task.id} data-testid={`task-row-${task.id}`}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>
                            {task.frameworkId ? (
                              <Badge variant="outline">
                                {task.frameworkId.toUpperCase()}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{task.assignedTo || <span className="text-gray-400">-</span>}</TableCell>
                          <TableCell>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : <span className="text-gray-400">-</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateMutation.mutate({ 
                                  id: task.id, 
                                  body: { status: nextStatus(task.status) } 
                                })}
                                disabled={task.status === 'completed' || updateMutation.isPending}
                                data-testid={`advance-task-${task.id}`}
                              >
                                Advance
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(task)}
                                data-testid={`edit-task-${task.id}`}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteMutation.mutate(task.id)}
                                disabled={deleteMutation.isPending}
                                data-testid={`delete-task-${task.id}`}
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