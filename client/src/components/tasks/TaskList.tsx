// client/src/components/tasks/TaskList.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Brain, Zap } from "lucide-react";
import TaskCard from "./TaskCard";
import { WeeklyRecommendations } from "./WeeklyRecommendations";
import { DeadlineIntelligence } from "./DeadlineIntelligence";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TaskFilters {
  status?: string;
  priority?: string;
  frameworkId?: string;
  search?: string;
  limit: number;
  offset: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'under_review' | 'completed' | 'blocked';
  dueDate?: string;
  progressPercentage: number;
  framework: {
    id: string;
    name: string;
    displayName: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  tags: string[];
  
  // AI-powered insights
  aiPriorityScore?: number;
  aiReasoning?: string;
  aiNextAction?: string;
  aiAnalyzedAt?: string;
}

interface TasksResponse {
  tasks: Task[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface TaskListProps {
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
}

export default function TaskList({ onCreateTask, onEditTask, onViewTask }: TaskListProps) {
  const [filters, setFilters] = useState<TaskFilters>({
    limit: 20,
    offset: 0
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // AI Analysis mutation
  const aiAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/tasks/ai-analysis/analyze', {
        method: 'POST'
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/ai-recommendations/weekly'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/ai-analysis/deadlines'] });
      toast({
        title: "AI Analysis Complete",
        description: "Tasks have been analyzed with AI insights and recommendations.",
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Unable to complete AI analysis. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Fetch tasks with filters
  const { data: tasksData, isLoading, error } = useQuery({
    queryKey: ['/api/tasks', filters],
    queryFn: async (): Promise<TasksResponse> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      return response.json();
    }
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' })
      });
      if (!response.ok) throw new Error('Failed to complete task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task completed",
        description: "Task has been marked as completed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFilterChange = (key: keyof TaskFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset pagination when filters change
    }));
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      offset: 0
    }));
  };

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate(taskId);
  };

  const loadMore = () => {
    if (tasksData && tasksData.pagination.hasMore) {
      setFilters(prev => ({
        ...prev,
        offset: prev.offset + prev.limit
      }));
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Failed to load tasks. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="glass-card p-8 animate-fadeInUp">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Task <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero animate-gradient-x">Management</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">Manage your compliance tasks efficiently with AI-powered insights</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => aiAnalysisMutation.mutate()}
              disabled={aiAnalysisMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-1 transform transition-all duration-300 font-medium px-6 py-3 text-lg group"
              data-testid="button-ai-analysis"
            >
              <Brain className={`h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300 ${aiAnalysisMutation.isPending ? 'animate-pulse' : ''}`} />
              {aiAnalysisMutation.isPending ? 'Analyzing...' : 'AI Analysis'}
            </Button>
            <Button 
              onClick={onCreateTask} 
              className="bg-gradient-primary text-white hover:shadow-lg hover:shadow-venzip-primary/25 hover:-translate-y-1 transform transition-all duration-300 font-medium px-6 py-3 text-lg group"
              data-testid="button-create-task"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Create Task
            </Button>
          </div>
        </div>
      </div>

      {/* AI Intelligence Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
        <WeeklyRecommendations />
        <DeadlineIntelligence />
      </div>

      {/* Enhanced Filters */}
      <Card className="glass-card group hover-lift animate-fadeInUp" style={{animationDelay: '0.1s'}}>
        <div className="absolute inset-0 bg-gradient-to-br from-venzip-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-gray-900">
            <div className="w-12 h-12 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg animate-glow-pulse">
              <Filter className="h-6 w-6 text-venzip-primary group-hover:animate-bounce" />
            </div>
            <div>
              <div className="text-xl font-bold">Smart Filters</div>
              <div className="text-sm text-gray-500 font-normal">Find and organize your tasks</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Enhanced Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-venzip-primary transition-colors duration-300" />
              <Input
                placeholder="Search tasks..."
                className="pl-10 glass-morphism-enhanced border-gray-200/50 focus:border-venzip-primary/50 focus:ring-venzip-primary/20 transition-all duration-300"
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                data-testid="input-search-tasks"
              />
            </div>

            {/* Status Filter */}
            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={filters.priority || 'all'} onValueChange={(value) => handleFilterChange('priority', value === 'all' ? '' : value)}>
              <SelectTrigger data-testid="select-priority-filter">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={() => setFilters({ limit: 20, offset: 0 })}
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {tasksData && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600" data-testid="text-results-summary">
            Showing {tasksData.tasks.length} of {tasksData.pagination.total} tasks
          </p>
          {tasksData.tasks.length > 0 && (
            <div className="flex gap-2">
              <Badge variant="outline" data-testid="badge-task-count">
                {tasksData.pagination.total} Total
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Task Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tasksData?.tasks.length === 0 ? (
        <Card className="glass-card animate-fadeInUp">
          <CardContent className="p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No tasks found</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {Object.keys(filters).some(key => filters[key as keyof TaskFilters] && key !== 'limit' && key !== 'offset')
                  ? "No tasks match your current filters. Try adjusting your search criteria."
                  : "Get started by creating your first task to track your compliance progress."}
              </p>
              <Button 
                onClick={onCreateTask} 
                className="bg-gradient-primary text-white hover:shadow-lg hover:shadow-venzip-primary/25 hover:-translate-y-1 transform transition-all duration-300 font-medium px-8 py-3 text-lg group"
                data-testid="button-create-first-task"
              >
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create Your First Task
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="task-grid">
            {tasksData?.tasks.map((task, index) => (
              <div 
                key={task.id} 
                className="animate-fadeInUp"
                style={{animationDelay: `${0.1 * index}s`}}
              >
                <TaskCard
                  task={task}
                  onEdit={onEditTask}
                  onComplete={handleCompleteTask}
                  onView={onViewTask}
                />
              </div>
            ))}
          </div>

          {/* Enhanced Load More */}
          {tasksData && tasksData.pagination.hasMore && (
            <div className="text-center animate-fadeInUp">
              <Button 
                variant="outline" 
                onClick={loadMore} 
                className="border-venzip-primary/30 text-venzip-primary hover:bg-venzip-primary/10 hover:border-venzip-primary/50 hover:scale-105 transition-all duration-300 font-medium px-8 py-3"
                data-testid="button-load-more"
              >
                Load More Tasks
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}