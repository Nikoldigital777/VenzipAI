import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Task } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import AIChat from "@/components/ai-chat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function Tasks() {
  const { toast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest("PUT", `/api/tasks/${id}`, updates);
      return response.json();
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

  const handleTaskToggle = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const updates = { 
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : null
    };
    
    updateTaskMutation.mutate({ id: taskId, updates });
  };

  const filteredTasks = tasks.filter((task) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "high") return task.priority === "high";
    if (selectedFilter === "due-soon") {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return dueDate <= weekFromNow && task.status !== 'completed';
    }
    return task.frameworkId?.includes(selectedFilter) || false;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-danger-coral/20 text-danger-coral';
      case 'medium': return 'bg-warning-orange/20 text-warning-orange';
      case 'low': return 'bg-success-green/20 text-success-green';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getFrameworkColor = (frameworkId: string) => {
    if (frameworkId?.includes('soc2')) return 'bg-venzip-primary/20 text-venzip-primary';
    if (frameworkId?.includes('iso27001')) return 'bg-venzip-accent/20 text-venzip-accent';
    if (frameworkId?.includes('hipaa')) return 'bg-danger-coral/20 text-danger-coral';
    if (frameworkId?.includes('gdpr')) return 'bg-venzip-secondary/20 text-venzip-secondary';
    return 'bg-gray-100 text-gray-600';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
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
            <p className="text-gray-600">Loading tasks...</p>
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
          
          {/* Tasks Header */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
                  <p className="text-gray-600">Manage your compliance tasks and track progress</p>
                </div>
                <Button className="bg-gradient-primary text-white hover:shadow-lg transition-all duration-200" data-testid="button-new-task">
                  <i className="fas fa-plus mr-2"></i>New Task
                </Button>
              </div>

              {/* Task Filters */}
              <div className="flex flex-wrap gap-4 mt-6">
                <Button
                  variant={selectedFilter === "all" ? "default" : "outline"}
                  onClick={() => setSelectedFilter("all")}
                  className={selectedFilter === "all" ? "bg-venzip-primary/10 text-venzip-primary border-venzip-primary/20" : ""}
                  data-testid="filter-all"
                >
                  All Tasks
                </Button>
                <Button
                  variant={selectedFilter === "soc2" ? "default" : "outline"}
                  onClick={() => setSelectedFilter("soc2")}
                  className={selectedFilter === "soc2" ? "bg-venzip-primary/10 text-venzip-primary border-venzip-primary/20" : ""}
                  data-testid="filter-soc2"
                >
                  SOC 2
                </Button>
                <Button
                  variant={selectedFilter === "iso27001" ? "default" : "outline"}
                  onClick={() => setSelectedFilter("iso27001")}
                  className={selectedFilter === "iso27001" ? "bg-venzip-primary/10 text-venzip-primary border-venzip-primary/20" : ""}
                  data-testid="filter-iso27001"
                >
                  ISO 27001
                </Button>
                <Button
                  variant={selectedFilter === "hipaa" ? "default" : "outline"}
                  onClick={() => setSelectedFilter("hipaa")}
                  className={selectedFilter === "hipaa" ? "bg-venzip-primary/10 text-venzip-primary border-venzip-primary/20" : ""}
                  data-testid="filter-hipaa"
                >
                  HIPAA
                </Button>
                <Button
                  variant={selectedFilter === "high" ? "default" : "outline"}
                  onClick={() => setSelectedFilter("high")}
                  className={selectedFilter === "high" ? "bg-venzip-primary/10 text-venzip-primary border-venzip-primary/20" : ""}
                  data-testid="filter-high-priority"
                >
                  High Priority
                </Button>
                <Button
                  variant={selectedFilter === "due-soon" ? "default" : "outline"}
                  onClick={() => setSelectedFilter("due-soon")}
                  className={selectedFilter === "due-soon" ? "bg-venzip-primary/10 text-venzip-primary border-venzip-primary/20" : ""}
                  data-testid="filter-due-soon"
                >
                  Due Soon
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Task List */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12" data-testid="no-tasks">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-tasks text-gray-400 text-xl"></i>
                    </div>
                    <p className="text-gray-500">No tasks found</p>
                    <p className="text-sm text-gray-400">
                      {selectedFilter === "all" 
                        ? "Create your first task to get started" 
                        : "No tasks match the current filter"}
                    </p>
                  </div>
                ) : (
                  filteredTasks.map((task: any) => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-venzip-primary/30 transition-all duration-200"
                      data-testid={`task-${task.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={task.status === 'completed'}
                          onCheckedChange={() => handleTaskToggle(task.id, task.status)}
                          disabled={updateTaskMutation.isPending}
                          data-testid={`checkbox-task-${task.id}`}
                        />
                        <div className={task.status === 'completed' ? 'opacity-60' : ''}>
                          <h3 className={`font-semibold text-gray-900 ${task.status === 'completed' ? 'line-through' : ''}`}>
                            {task.title}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.status === 'completed' ? 'Completed' : `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority`}
                            </Badge>
                            {task.frameworkId && (
                              <Badge className={getFrameworkColor(task.frameworkId)}>
                                {task.frameworkId.toUpperCase()}
                              </Badge>
                            )}
                            <span className="text-sm text-gray-500">
                              {task.status === 'completed' && task.completedAt
                                ? `Completed: ${formatDate(task.completedAt)}`
                                : `Due: ${formatDate(task.dueDate)}`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.assignedTo && (
                          <span className="text-sm text-gray-500">
                            {task.status === 'completed' ? 'Completed by' : 'Assigned to'}: {task.assignedTo}
                          </span>
                        )}
                        <Button variant="ghost" size="sm" data-testid={`menu-task-${task.id}`}>
                          <i className="fas fa-ellipsis-v text-gray-400"></i>
                        </Button>
                      </div>
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
