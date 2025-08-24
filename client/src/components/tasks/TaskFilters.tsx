// client/src/components/tasks/TaskFilters.tsx
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  X, 
  Calendar,
  User,
  Flag,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react";

export interface TaskFilterState {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  frameworkId?: string;
  assignedTo?: string;
  dueDateRange?: 'overdue' | 'today' | 'this_week' | 'this_month' | 'custom';
  sortBy?: 'dueDate' | 'priority' | 'status' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface FilterPreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  filters: Partial<TaskFilterState>;
  color: string;
}

interface TaskFiltersProps {
  filters: TaskFilterState;
  onFiltersChange: (filters: TaskFilterState) => void;
  totalTasks?: number;
  filteredCount?: number;
  frameworks?: Array<{ id: string; name: string; displayName: string }>;
  users?: Array<{ id: string; firstName: string; lastName: string; email: string }>;
}

const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'my_urgent',
    name: 'Urgent Tasks',
    icon: <AlertTriangle className="h-4 w-4" />,
    description: 'High priority tasks due soon',
    filters: { priority: 'high', dueDateRange: 'this_week' },
    color: 'bg-red-100 text-red-800 hover:bg-red-200'
  },
  {
    id: 'in_progress',
    name: 'In Progress',
    icon: <RefreshCw className="h-4 w-4" />,
    description: 'Tasks currently being worked on',
    filters: { status: 'in_progress' },
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  },
  {
    id: 'overdue',
    name: 'Overdue',
    icon: <Clock className="h-4 w-4" />,
    description: 'Tasks past their due date',
    filters: { dueDateRange: 'overdue' },
    color: 'bg-red-100 text-red-800 hover:bg-red-200'
  },
  {
    id: 'review_ready',
    name: 'Ready for Review',
    icon: <CheckCircle className="h-4 w-4" />,
    description: 'Tasks waiting for review',
    filters: { status: 'under_review' },
    color: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
  },
  {
    id: 'this_week',
    name: 'Due This Week',
    icon: <Calendar className="h-4 w-4" />,
    description: 'Tasks due in the next 7 days',
    filters: { dueDateRange: 'this_week' },
    color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
  },
  {
    id: 'critical',
    name: 'Critical Priority',
    icon: <Zap className="h-4 w-4" />,
    description: 'Critical priority tasks requiring immediate attention',
    filters: { priority: 'critical' },
    color: 'bg-red-100 text-red-800 hover:bg-red-200'
  }
];

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', icon: '⭕' },
  { value: 'in_progress', label: 'In Progress', icon: '🔄' },
  { value: 'under_review', label: 'Under Review', icon: '👀' },
  { value: 'completed', label: 'Completed', icon: '✅' },
  { value: 'blocked', label: 'Blocked', icon: '🚫' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', icon: '🟢', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', icon: '🟡', color: 'text-yellow-600' },
  { value: 'high', label: 'High', icon: '🟠', color: 'text-orange-600' },
  { value: 'critical', label: 'Critical', icon: '🔴', color: 'text-red-600' }
];

const CATEGORY_OPTIONS = [
  { value: 'policy', label: 'Policy', icon: '📋' },
  { value: 'procedure', label: 'Procedure', icon: '📝' },
  { value: 'training', label: 'Training', icon: '🎓' },
  { value: 'audit', label: 'Audit', icon: '🔍' },
  { value: 'risk_assessment', label: 'Risk Assessment', icon: '⚠️' },
  { value: 'documentation', label: 'Documentation', icon: '📄' },
  { value: 'technical', label: 'Technical', icon: '⚙️' },
  { value: 'other', label: 'Other', icon: '📌' }
];

const DUE_DATE_OPTIONS = [
  { value: 'overdue', label: 'Overdue', icon: '⏰' },
  { value: 'today', label: 'Due Today', icon: '📅' },
  { value: 'this_week', label: 'Due This Week', icon: '📊' },
  { value: 'this_month', label: 'Due This Month', icon: '🗓️' }
];

const SORT_OPTIONS = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'title', label: 'Title' },
  { value: 'createdAt', label: 'Created Date' }
];

export default function TaskFilters({ 
  filters, 
  onFiltersChange, 
  totalTasks = 0, 
  filteredCount = 0,
  frameworks = [],
  users = []
}: TaskFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchTerm || undefined, offset: 0 });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Active filters count for smart UI
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.category) count++;
    if (filters.frameworkId) count++;
    if (filters.assignedTo) count++;
    if (filters.dueDateRange) count++;
    return count;
  }, [filters]);

  // Active filter badges
  const activeFilterBadges = useMemo(() => {
    const badges = [];
    
    if (filters.status) {
      const status = STATUS_OPTIONS.find(s => s.value === filters.status);
      badges.push({ key: 'status', label: `Status: ${status?.label}`, value: filters.status });
    }
    
    if (filters.priority) {
      const priority = PRIORITY_OPTIONS.find(p => p.value === filters.priority);
      badges.push({ key: 'priority', label: `Priority: ${priority?.label}`, value: filters.priority });
    }
    
    if (filters.category) {
      const category = CATEGORY_OPTIONS.find(c => c.value === filters.category);
      badges.push({ key: 'category', label: `Category: ${category?.label}`, value: filters.category });
    }
    
    if (filters.frameworkId) {
      const framework = frameworks.find(f => f.id === filters.frameworkId);
      badges.push({ key: 'frameworkId', label: `Framework: ${framework?.displayName}`, value: filters.frameworkId });
    }
    
    if (filters.dueDateRange) {
      const dueDate = DUE_DATE_OPTIONS.find(d => d.value === filters.dueDateRange);
      badges.push({ key: 'dueDateRange', label: dueDate?.label, value: filters.dueDateRange });
    }
    
    return badges;
  }, [filters, frameworks]);

  const updateFilter = (key: keyof TaskFilterState, value: any) => {
    onFiltersChange({ 
      ...filters, 
      [key]: value || undefined,
      offset: 0 // Reset pagination when filters change
    });
  };

  const applyPreset = (preset: FilterPreset) => {
    onFiltersChange({ 
      ...filters, 
      ...preset.filters,
      offset: 0
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFiltersChange({ 
      limit: filters.limit || 20,
      offset: 0,
      sortBy: 'dueDate',
      sortOrder: 'asc'
    });
  };

  const removeFilter = (key: keyof TaskFilterState) => {
    if (key === 'search') {
      setSearchTerm('');
    }
    updateFilter(key, undefined);
  };

  return (
    <div className="space-y-4">
      {/* Quick Search and Filter Toggle */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex gap-3 items-center">
            {/* Smart Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks by title, description, or tags..."
                className="pl-10 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-tasks"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Advanced Filters Toggle */}
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2" data-testid="button-advanced-filters">
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                  <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>

            {/* Clear All Filters */}
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-all-filters">
                Clear All
              </Button>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600" data-testid="text-filter-results">
              {filteredCount === totalTasks ? (
                `Showing all ${totalTasks} tasks`
              ) : (
                `Showing ${filteredCount} of ${totalTasks} tasks`
              )}
            </p>

            {/* Sorting Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select value={filters.sortBy || 'dueDate'} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger className="w-32" data-testid="select-sort-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                data-testid="button-sort-order"
              >
                {filters.sortOrder === 'desc' ? '↓' : '↑'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Filter Presets */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Smart Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {FILTER_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 ${preset.color} transition-colors`}
                onClick={() => applyPreset(preset)}
                title={preset.description}
                data-testid={`preset-${preset.id}`}
              >
                {preset.icon}
                {preset.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Filter Badges */}
      {activeFilterBadges.length > 0 && (
        <Card className="glass-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-600">Active filters:</span>
              {activeFilterBadges.map((badge) => (
                <Badge
                  key={badge.key}
                  variant="secondary"
                  className="flex items-center gap-1"
                  data-testid={`active-filter-${badge.key}`}
                >
                  {badge.label}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFilter(badge.key as keyof TaskFilterState)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Filters Panel */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleContent>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Advanced Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status and Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                  <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}>
                    <SelectTrigger data-testid="select-status-filter">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {STATUS_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
                  <Select value={filters.priority || 'all'} onValueChange={(value) => updateFilter('priority', value === 'all' ? undefined : value)}>
                    <SelectTrigger data-testid="select-priority-filter">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      {PRIORITY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            <span className={option.color}>{option.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category and Framework Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <Select value={filters.category || 'all'} onValueChange={(value) => updateFilter('category', value === 'all' ? undefined : value)}>
                    <SelectTrigger data-testid="select-category-filter">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Framework</label>
                  <Select value={filters.frameworkId || 'all'} onValueChange={(value) => updateFilter('frameworkId', value === 'all' ? undefined : value)}>
                    <SelectTrigger data-testid="select-framework-filter">
                      <SelectValue placeholder="All Frameworks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Frameworks</SelectItem>
                      {frameworks.map(framework => (
                        <SelectItem key={framework.id} value={framework.id}>
                          {framework.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Due Date and Assigned To Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Due Date</label>
                  <Select value={filters.dueDateRange || 'all'} onValueChange={(value) => updateFilter('dueDateRange', value === 'all' ? undefined : value)}>
                    <SelectTrigger data-testid="select-due-date-filter">
                      <SelectValue placeholder="All Due Dates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Due Dates</SelectItem>
                      {DUE_DATE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Assigned To</label>
                  <Select value={filters.assignedTo || 'all'} onValueChange={(value) => updateFilter('assignedTo', value === 'all' ? undefined : value)}>
                    <SelectTrigger data-testid="select-assigned-to-filter">
                      <SelectValue placeholder="All Assignees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignees</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Filter Actions */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                    Clear All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsAdvancedOpen(false)}
                    data-testid="button-close-advanced"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}