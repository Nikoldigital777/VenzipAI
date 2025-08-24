// client/src/components/tasks/TaskList.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter } from "lucide-react";
import TaskCard from "./TaskCard";
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600">Manage your compliance tasks efficiently</p>
        </div>
        <Button onClick={onCreateTask} data-testid="button-create-task">
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                className="pl-10"
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
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-4">
                {Object.keys(filters).some(key => filters[key as keyof TaskFilters] && key !== 'limit' && key !== 'offset')
                  ? "No tasks match your current filters. Try adjusting your search criteria."
                  : "Get started by creating your first task."}
              </p>
              <Button onClick={onCreateTask} data-testid="button-create-first-task">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Task
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="task-grid">
            {tasksData.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onComplete={handleCompleteTask}
                onView={onViewTask}
              />
            ))}
          </div>

          {/* Load More */}
          {tasksData && tasksData.pagination.hasMore && (
            <div className="text-center">
              <Button variant="outline" onClick={loadMore} data-testid="button-load-more">
                Load More Tasks
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}