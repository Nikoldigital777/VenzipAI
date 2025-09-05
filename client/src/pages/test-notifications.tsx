import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare, AlertTriangle, Calendar, FileText } from 'lucide-react';
import Navigation from '@/components/navigation';

export default function TestNotifications() {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [riskTitle, setRiskTitle] = useState('');
  const [riskDescription, setRiskDescription] = useState('');
  const [riskImpact, setRiskImpact] = useState('medium');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const res = await apiRequest('POST', '/api/tasks', taskData);
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onSuccess: (task) => {
      toast({
        title: 'Task Created',
        description: `Task "${task.title}" created successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/count'] });
      setTaskTitle('');
      setTaskDueDate('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    },
  });

  // Create risk mutation
  const createRiskMutation = useMutation({
    mutationFn: async (riskData: any) => {
      const res = await apiRequest('POST', '/api/risks', riskData);
      if (!res.ok) throw new Error('Failed to create risk');
      return res.json();
    },
    onSuccess: (risk) => {
      toast({
        title: 'Risk Created',
        description: `Risk "${risk.title}" created successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/count'] });
      setRiskTitle('');
      setRiskDescription('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create risk',
        variant: 'destructive',
      });
    },
  });

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;
    
    const taskData = {
      title: taskTitle,
      priority: taskPriority,
      status: 'not_started',
      ...(taskDueDate && { dueDate: new Date(taskDueDate).toISOString() }),
    };
    
    createTaskMutation.mutate(taskData);
  };

  const handleCreateRisk = () => {
    if (!riskTitle.trim() || !riskDescription.trim()) return;
    
    const riskData = {
      title: riskTitle,
      description: riskDescription,
      category: 'operational',
      impact: riskImpact,
      likelihood: 'medium',
    };
    
    createRiskMutation.mutate(riskData);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getNextWeekDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };

  return (
    <>
      <Navigation />
      <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50/80 via-white/50 to-venzip-primary/5 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-venzip-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-venzip-accent/10 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>
        
        <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
          <div className="mb-12 text-center animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Test <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero animate-gradient-x">Notification System</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Create tasks and risks to test the accurate notification system. Check the notification bell in the top navigation.
            </p>
          </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Task Creation */}
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-venzip-primary" />
              Create Test Task
            </CardTitle>
            <CardDescription>
              Create high-priority tasks or tasks with due dates to trigger notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                placeholder="Enter task title..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="task-priority">Priority</Label>
              <Select value={taskPriority} onValueChange={setTaskPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="task-due-date">Due Date (Optional)</Label>
              <Input
                id="task-due-date"
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateTask}
                disabled={!taskTitle.trim() || createTaskMutation.isPending}
                className="flex-1"
              >
                {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p><strong>Quick tests:</strong></p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTaskTitle('Security Audit Review');
                  setTaskPriority('high');
                  setTaskDueDate(getTomorrowDate());
                }}
              >
                High Priority Task (Due Tomorrow)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => {
                  setTaskTitle('Critical System Update');
                  setTaskPriority('critical');
                  setTaskDueDate(getNextWeekDate());
                }}
              >
                Critical Task
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Risk Creation */}
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Create Test Risk
            </CardTitle>
            <CardDescription>
              Create high-impact risks to trigger risk alert notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="risk-title">Risk Title</Label>
              <Input
                id="risk-title"
                placeholder="Enter risk title..."
                value={riskTitle}
                onChange={(e) => setRiskTitle(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="risk-description">Description</Label>
              <Textarea
                id="risk-description"
                placeholder="Describe the risk..."
                value={riskDescription}
                onChange={(e) => setRiskDescription(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="risk-impact">Impact Level</Label>
              <Select value={riskImpact} onValueChange={setRiskImpact}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateRisk}
                disabled={!riskTitle.trim() || !riskDescription.trim() || createRiskMutation.isPending}
                className="flex-1"
              >
                {createRiskMutation.isPending ? 'Creating...' : 'Create Risk'}
              </Button>
            </div>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p><strong>Quick tests:</strong></p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRiskTitle('Data Breach Vulnerability');
                  setRiskDescription('Potential security vulnerability in customer data handling system that could lead to unauthorized access.');
                  setRiskImpact('high');
                }}
              >
                High-Impact Risk
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/20 mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Notification System Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Task Notifications</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• High/Critical priority task creation</li>
                <li>• Tasks due within 7 days</li>
                <li>• Task completion celebrations</li>
                <li>• Overdue task warnings</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Risk Notifications</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• High-impact risk identification</li>
                <li>• Critical risk scores (≥6)</li>
                <li>• Risk mitigation success</li>
                <li>• Risk escalation alerts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </>
  );
}