import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AIChat from "@/components/ai-chat";
import { 
  Calendar as CalendarIcon, 
  Filter, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { format, isSameDay, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

type Task = {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "not_started" | "in_progress" | "under_review" | "completed" | "blocked";
  dueDate?: string;
  frameworkId?: string;
  complianceRequirement?: string;
  evidenceRequired?: boolean;
  estimatedHours?: number;
};

type Framework = {
  id: string;
  name: string;
  displayName: string;
  description: string;
  complexity: string;
  estimatedTimeMonths: number;
  totalControls: number;
  icon: string;
  color: string;
};

type ComplianceRequirement = {
  id: string;
  frameworkId: string;
  requirementId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  evidenceTypes: string[];
};

export default function AuditCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedFramework, setSelectedFramework] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"calendar" | "timeline">("calendar");

  // Fetch tasks
  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useQuery<{tasks: Task[], pagination: any}>({
    queryKey: ["/api/tasks"],
  });

  // Fetch frameworks
  const { data: frameworks, isLoading: frameworksLoading } = useQuery<Framework[]>({
    queryKey: ["/api/frameworks"],
  });

  // Fetch compliance requirements
  const { data: requirements, isLoading: requirementsLoading } = useQuery<ComplianceRequirement[]>({
    queryKey: ["/api/compliance/requirements"],
  });

  const tasks: Task[] = tasksData?.tasks || [];
  const isLoading = tasksLoading || frameworksLoading || requirementsLoading;

  // Filter tasks based on selected filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (selectedFramework !== "all" && task.frameworkId !== selectedFramework) {
        return false;
      }
      if (selectedPriority !== "all" && task.priority !== selectedPriority) {
        return false;
      }
      return task.dueDate; // Only show tasks with due dates
    });
  }, [tasks, selectedFramework, selectedPriority]);

  // Get tasks for selected date
  const tasksForSelectedDate = useMemo(() => {
    return filteredTasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), selectedDate)
    );
  }, [filteredTasks, selectedDate]);

  // Get upcoming milestones (next 30 days)
  const upcomingMilestones = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);

    return filteredTasks
      .filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [filteredTasks]);

  // Generate calendar data with task indicators
  const calendarDaysWithTasks = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayTasks = filteredTasks.filter(task => 
        task.dueDate && isSameDay(new Date(task.dueDate), day)
      );

      const priorities = dayTasks.map(t => t.priority);
      const hasHigh = priorities.includes("critical") || priorities.includes("high");
      const hasMedium = priorities.includes("medium");

      return {
        date: day,
        taskCount: dayTasks.length,
        hasHighPriority: hasHigh,
        hasMediumPriority: hasMedium,
        tasks: dayTasks
      };
    });
  }, [filteredTasks, selectedDate]);

  const getFrameworkById = (id: string) => 
    (frameworks || []).find((f: Framework) => f.id === id);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium": return "text-blue-600 bg-blue-50 border-blue-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress": return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case "blocked": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <>
        
        <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50/80 via-white/50 to-venzip-primary/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
            <Card className="glass-card">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <CalendarIcon className="h-8 w-8 text-white" />
                </div>
                <div className="text-xl font-medium text-gray-700">Loading audit calendar...</div>
                <div className="text-sm text-gray-500 mt-2">Preparing your compliance timeline</div>
              </CardContent>
            </Card>
          </div>
        </div>
        <AIChat />
      </>
    );
  }

  if (tasksError) {
    return (
      <>
        
        <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50/80 via-white/50 to-danger-coral/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
            <Card className="glass-card border-danger-coral/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="w-10 h-10 bg-danger-coral/10 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-danger-coral" />
                  </div>
                  Audit Calendar Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-danger-coral/5 border border-danger-coral/20 rounded-xl">
                  <div className="text-danger-coral text-sm font-medium">
                    Failed to load audit calendar data.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <AIChat />
      </>
    );
  }

  return (
    <>
      
      <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50/80 via-white/50 to-venzip-primary/5 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-venzip-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-venzip-accent/10 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          {/* Header Section */}
          <div className="mb-12 text-center animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Audit <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero animate-gradient-x">Calendar</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Plan your audits and track compliance milestones with framework-specific requirements
            </p>
          </div>

          {/* Controls */}
          <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Framework Filter */}
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger className="w-48 glass-card border-0" data-testid="select-framework">
                  <SelectValue placeholder="All Frameworks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frameworks</SelectItem>
                  {(frameworks || []).map((framework: Framework) => (
                    <SelectItem key={framework.id} value={framework.id}>
                      {framework.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-40 glass-card border-0" data-testid="select-priority">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className="glass-card border-0"
                data-testid="button-calendar-view"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={viewMode === "timeline" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("timeline")}
                className="glass-card border-0"
                data-testid="button-timeline-view"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Timeline
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar View */}
            <Card className="lg:col-span-2 glass-card group hover-lift animate-fadeInUp">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="w-12 h-12 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-2xl flex items-center justify-center">
                    <CalendarIcon className="h-6 w-6 text-venzip-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">
                      {viewMode === "calendar" ? "Audit Calendar" : "Compliance Timeline"}
                    </div>
                    <div className="text-sm text-gray-500 font-normal">
                      {viewMode === "calendar" ? "Click dates to view tasks" : "Upcoming milestones"}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {viewMode === "calendar" ? (
                  <div className="space-y-6">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-xl border-0 w-full"
                      modifiers={{
                        hasEvents: calendarDaysWithTasks
                          .filter(day => day.taskCount > 0)
                          .map(day => day.date),
                        highPriority: calendarDaysWithTasks
                          .filter(day => day.hasHighPriority)
                          .map(day => day.date),
                      }}
                      modifiersStyles={{
                        hasEvents: { 
                          backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                          color: 'rgb(99, 102, 241)',
                          fontWeight: 'bold'
                        },
                        highPriority: { 
                          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                          color: 'rgb(239, 68, 68)',
                          fontWeight: 'bold'
                        },
                      }}
                      data-testid="audit-calendar"
                    />

                    {/* Calendar Legend */}
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                        <span className="text-gray-600">Has Tasks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                        <span className="text-gray-600">High Priority</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingMilestones.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <div className="text-lg font-medium text-gray-900 mb-2">No Upcoming Milestones</div>
                        <div className="text-sm text-gray-600">Your audit calendar is clear for the next 30 days</div>
                      </div>
                    ) : (
                      upcomingMilestones.map((task, index) => {
                        const framework = getFrameworkById(task.frameworkId || "");
                        const daysUntilDue = Math.ceil((new Date(task.dueDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                        return (
                          <Card key={task.id} className="glass-card border-0 shadow-sm hover-lift animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    {getStatusIcon(task.status)}
                                    <div className="font-semibold text-gray-900">{task.title}</div>
                                    <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-gray-600 mb-2">{task.description}</div>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>Due: {format(new Date(task.dueDate!), 'MMM dd, yyyy')}</span>
                                    </div>
                                    {framework && (
                                      <div className="flex items-center gap-1">
                                        <Target className="h-3 w-3" />
                                        <span>{framework.displayName}</span>
                                      </div>
                                    )}
                                    {task.estimatedHours && (
                                      <div className="flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{task.estimatedHours}h estimated</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  daysUntilDue < 0 ? 'bg-red-100 text-red-600' :
                                  daysUntilDue <= 3 ? 'bg-orange-100 text-orange-600' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                                   daysUntilDue === 0 ? 'Due today' :
                                   `${daysUntilDue} days left`}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Date Tasks */}
            <Card className="lg:col-span-1 glass-card group hover-lift animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="w-12 h-12 bg-gradient-to-br from-venzip-secondary/20 to-venzip-secondary/10 rounded-2xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-venzip-secondary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">
                      {format(selectedDate, 'MMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500 font-normal">
                      {tasksForSelectedDate.length} tasks scheduled
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasksForSelectedDate.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-sm text-gray-500 font-medium">No tasks scheduled</div>
                      <div className="text-xs text-gray-400 mt-1">Select a different date to view tasks</div>
                    </div>
                  ) : (
                    tasksForSelectedDate.map((task, index) => {
                      const framework = getFrameworkById(task.frameworkId || "");

                      return (
                        <Card key={task.id} className="glass-card border-0 shadow-sm hover-lift animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(task.status)}
                                <div className="font-medium text-gray-900 text-sm">{task.title}</div>
                              </div>
                              <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </Badge>
                            </div>

                            {task.description && (
                              <div className="text-xs text-gray-600 mb-2">{task.description}</div>
                            )}

                            <div className="flex flex-wrap gap-2 text-xs">
                              {framework && (
                                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">
                                  {framework.displayName}
                                </span>
                              )}
                              <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded capitalize">
                                {task.category.replace('_', ' ')}
                              </span>
                              {task.evidenceRequired && (
                                <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded">
                                  Evidence Required
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Framework-Specific Requirements Summary */}
          {selectedFramework !== "all" && requirements && (
            <Card className="mt-8 glass-card group hover-lift animate-fadeInUp" style={{animationDelay: '0.4s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="w-12 h-12 bg-gradient-to-br from-venzip-accent/20 to-venzip-accent/10 rounded-2xl flex items-center justify-center">
                    <Filter className="h-6 w-6 text-venzip-accent" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">Framework Requirements</div>
                    <div className="text-sm text-gray-500 font-normal">
                      {getFrameworkById(selectedFramework)?.displayName || "Selected Framework"} compliance requirements
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(requirements || [])
                    .filter((req: ComplianceRequirement) => req.frameworkId === selectedFramework)
                    .slice(0, 6)
                    .map((requirement: ComplianceRequirement, index: number) => (
                      <Card key={requirement.id} className="glass-card border-0 shadow-sm hover-lift animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="text-sm font-medium text-gray-900">{requirement.title}</div>
                            <Badge className={`text-xs ${getPriorityColor(requirement.priority)}`}>
                              {requirement.priority}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 mb-2">{requirement.description}</div>
                          <div className="flex flex-wrap gap-1">
                            <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded text-xs">
                              {requirement.requirementId}
                            </span>
                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs capitalize">
                              {requirement.category.replace('_', ' ')}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <AIChat />
    </>
  );
}