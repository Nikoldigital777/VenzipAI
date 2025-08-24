import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Clock,
  CheckCircle,
  X,
  Settings,
  Filter,
  RefreshCw
} from "lucide-react";
import { format } from 'date-fns';

type RiskNotification = {
  id: string;
  userId: string;
  type: 'risk_threshold' | 'trend_alert' | 'compliance_gap' | 'task_overdue' | 'score_improvement';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  metadata?: {
    riskScore?: number;
    frameworkId?: string;
    taskId?: string;
    threshold?: number;
  };
  createdAt: string;
};

type NotificationSettings = {
  riskThresholdAlerts: boolean;
  trendAlerts: boolean;
  complianceGapAlerts: boolean;
  taskOverdueAlerts: boolean;
  scoreImprovementAlerts: boolean;
  emailNotifications: boolean;
  riskThreshold: number;
};

export default function RiskNotifications() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'unread' | 'high' | 'critical'>('all');
  const [showSettings, setShowSettings] = useState(false);

  // Fetch notifications
  const { data: notifications, isLoading, refetch } = useQuery<RiskNotification[]>({
    queryKey: ["/api/notifications", filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set("filter", filter);
      const res = await apiRequest("GET", `/api/notifications?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load notifications");
      return res.json();
    },
  });

  // Fetch notification settings
  const { data: settings } = useQuery<NotificationSettings>({
    queryKey: ["/api/notifications/settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/notifications/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      return res.json();
    },
  });

  // Mark notification as read
  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await apiRequest("PUT", `/api/notifications/${notificationId}/read`);
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Dismiss notification
  const dismissMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await apiRequest("DELETE", `/api/notifications/${notificationId}`);
      if (!res.ok) throw new Error("Failed to dismiss notification");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Notification dismissed",
        description: "The notification has been removed.",
      });
    },
  });

  // Update settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<NotificationSettings>) => {
      const res = await apiRequest("PUT", "/api/notifications/settings", newSettings);
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/settings"] });
      toast({
        title: "Settings updated",
        description: "Notification preferences have been saved.",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'risk_threshold': return <AlertTriangle className="h-4 w-4" />;
      case 'trend_alert': return <TrendingDown className="h-4 w-4" />;
      case 'compliance_gap': return <Shield className="h-4 w-4" />;
      case 'task_overdue': return <Clock className="h-4 w-4" />;
      case 'score_improvement': return <TrendingUp className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-700';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-700';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'low': return 'bg-blue-100 border-blue-500 text-blue-700';
      default: return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Mock notifications for demonstration
  const mockNotifications: RiskNotification[] = notifications || [
    {
      id: '1',
      userId: 'user1',
      type: 'risk_threshold',
      title: 'High Risk Score Detected',
      message: 'Your overall risk score has increased to 75/100, exceeding the threshold of 70.',
      severity: 'high',
      isRead: false,
      metadata: { riskScore: 75, threshold: 70 },
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      userId: 'user1',
      type: 'compliance_gap',
      title: 'GDPR Compliance Gap',
      message: 'Critical gaps identified in data protection controls. 3 high-priority tasks require immediate attention.',
      severity: 'critical',
      isRead: false,
      metadata: { frameworkId: 'gdpr' },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      userId: 'user1',
      type: 'task_overdue',
      title: 'Overdue Security Task',
      message: 'The task "Implement multi-factor authentication" is 3 days overdue.',
      severity: 'medium',
      isRead: true,
      metadata: { taskId: 'task123' },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      userId: 'user1',
      type: 'score_improvement',
      title: 'Risk Score Improved',
      message: 'Great progress! Your risk score has improved from 65 to 58 over the past week.',
      severity: 'low',
      isRead: false,
      metadata: { riskScore: 58 },
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      userId: 'user1',
      type: 'trend_alert',
      title: 'Declining Risk Trend',
      message: 'Risk scores have been trending upward for the past 7 days. Review recent changes.',
      severity: 'medium',
      isRead: false,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
  ];

  const filteredNotifications = mockNotifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'high') return notification.severity === 'high';
    if (filter === 'critical') return notification.severity === 'critical';
    return true;
  });

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Risk Notifications</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure your alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Risk threshold alerts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Trend alerts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Compliance gap alerts</span>
                </label>
              </div>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Task overdue alerts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Score improvement alerts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Email notifications</span>
                </label>
              </div>
            </div>
            <div className="pt-2">
              <label className="block text-sm font-medium mb-2">Risk Score Threshold</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                defaultValue="70" 
                className="w-full" 
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>70</span>
                <span>100</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-white/50 dark:bg-gray-800/50 p-1 rounded-lg border border-gray-200 dark:border-gray-700 w-fit">
        {['all', 'unread', 'high', 'critical'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filter === filterOption
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Filter className="h-4 w-4 mr-2 inline" />
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <BellOff className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No notifications found</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all hover:shadow-md border-l-4 ${getSeverityColor(notification.severity)} ${
                !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full ${getSeverityColor(notification.severity)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <Badge className={getSeverityBadgeColor(notification.severity)}>
                          {notification.severity}
                        </Badge>
                        {!notification.isRead && (
                          <Badge variant="secondary">New</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(notification.createdAt), 'PPp')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!notification.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markReadMutation.mutate(notification.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissMutation.mutate(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}