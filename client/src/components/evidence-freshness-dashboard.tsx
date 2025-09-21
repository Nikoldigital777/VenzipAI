
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  Download,
  Eye,
  Upload,
  TrendingUp,
  AlertCircle,
  Zap
} from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';

type FreshnessStatus = {
  fresh: number;
  warning: number;
  expired: number;
  overdue: number;
};

type FreshnessDocument = {
  id: string;
  fileName: string;
  fileType: string;
  status: string;
  uploadedAt: string;
  validUntil?: string;
  freshnessMonths?: number;
  daysUntilExpiry?: number;
  daysOverdue?: number;
  frameworkId?: string;
  isExpired?: boolean;
};

type FreshnessDashboardData = {
  summary: FreshnessStatus;
  expiringNext30Days: FreshnessDocument[];
  expiredDocuments: FreshnessDocument[];
  totalDocuments: number;
};

export default function EvidenceFreshnessDashboard() {
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch freshness dashboard data
  const { data: freshnessData, isLoading, refetch } = useQuery<FreshnessDashboardData>({
    queryKey: ['/api/evidence/freshness'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/evidence/freshness");
        if (!response.ok) {
          throw new Error("Failed to fetch freshness data");
        }
        return response.json();
      } catch (error) {
        // Mock data for development
        return {
          summary: {
            fresh: 15,
            warning: 3,
            expired: 2,
            overdue: 1
          },
          expiringNext30Days: [
            {
              id: "doc1",
              fileName: "Security Policy v2.1.pdf",
              fileType: "application/pdf",
              status: "verified",
              uploadedAt: "2024-01-15T10:00:00Z",
              validUntil: "2024-02-15T10:00:00Z",
              freshnessMonths: 12,
              daysUntilExpiry: 5,
              frameworkId: "soc2"
            },
            {
              id: "doc2",
              fileName: "Access Control Matrix.xlsx",
              fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              status: "verified",
              uploadedAt: "2024-01-20T10:00:00Z",
              validUntil: "2024-02-20T10:00:00Z",
              freshnessMonths: 6,
              daysUntilExpiry: 15,
              frameworkId: "iso27001"
            }
          ],
          expiredDocuments: [
            {
              id: "doc3",
              fileName: "Risk Assessment Report 2023.pdf",
              fileType: "application/pdf",
              status: "verified",
              uploadedAt: "2023-12-01T10:00:00Z",
              validUntil: "2024-01-01T10:00:00Z",
              freshnessMonths: 12,
              daysOverdue: 15,
              frameworkId: "hipaa",
              isExpired: true
            }
          ],
          totalDocuments: 21
        };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 60000
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Freshness data refreshed",
        description: "Evidence freshness status has been updated",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh freshness data",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: 'fresh' | 'warning' | 'expired' | 'overdue') => {
    switch (status) {
      case 'fresh':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: 'fresh' | 'warning' | 'expired' | 'overdue') => {
    switch (status) {
      case 'fresh':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'expired':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'overdue':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const calculateFreshnessPercentage = (summary: FreshnessStatus) => {
    const total = summary.fresh + summary.warning + summary.expired + summary.overdue;
    return total > 0 ? Math.round((summary.fresh / total) * 100) : 0;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Evidence Freshness</h2>
            <p className="text-gray-600">Monitor and manage evidence lifecycle</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const summary = freshnessData?.summary || { fresh: 0, warning: 0, expired: 0, overdue: 0 };
  const totalDocuments = freshnessData?.totalDocuments || 0;
  const freshnessPercentage = calculateFreshnessPercentage(summary);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Evidence Freshness</h2>
          <p className="text-gray-600">Monitor and manage evidence lifecycle</p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Freshness Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="h-5 w-5" />
            Overall Evidence Freshness
          </CardTitle>
          <CardDescription>
            Percentage of evidence documents that are current and up-to-date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Freshness Score</span>
                <span className="font-medium">{freshnessPercentage}%</span>
              </div>
              <Progress value={freshnessPercentage} className="h-3" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">{summary.fresh}</div>
              <div className="text-sm text-blue-600">of {totalDocuments} fresh</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fresh Documents</p>
                <p className="text-2xl font-bold text-green-600">{summary.fresh}</p>
              </div>
              {getStatusIcon('fresh')}
            </div>
            <p className="text-xs text-gray-500 mt-2">Up-to-date evidence</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.warning}</p>
              </div>
              {getStatusIcon('warning')}
            </div>
            <p className="text-xs text-gray-500 mt-2">Within 30 days</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recently Expired</p>
                <p className="text-2xl font-bold text-orange-600">{summary.expired}</p>
              </div>
              {getStatusIcon('expired')}
            </div>
            <p className="text-xs text-gray-500 mt-2">Need attention</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{summary.overdue}</p>
              </div>
              {getStatusIcon('overdue')}
            </div>
            <p className="text-xs text-gray-500 mt-2">Critical updates needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <Tabs defaultValue="expiring" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expiring">
            Expiring Soon ({freshnessData?.expiringNext30Days?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expired ({freshnessData?.expiredDocuments?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Documents Expiring in Next 30 Days
              </CardTitle>
              <CardDescription>
                These documents will expire soon and may need to be updated or renewed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!freshnessData?.expiringNext30Days?.length ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">No documents expiring in the next 30 days</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Framework</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Expires In</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {freshnessData.expiringNext30Days.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">{doc.fileName}</p>
                              <p className="text-sm text-gray-500">{doc.fileType}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {doc.frameworkId && (
                            <Badge variant="outline" className="capitalize">
                              {doc.frameworkId}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={doc.daysUntilExpiry! <= 7 ? 'border-orange-200 text-orange-700 bg-orange-50' : 'border-yellow-200 text-yellow-700 bg-yellow-50'}
                            >
                              {doc.daysUntilExpiry} days
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Expired Documents
              </CardTitle>
              <CardDescription>
                These documents have expired and need immediate attention to maintain compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!freshnessData?.expiredDocuments?.length ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">No expired documents</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Framework</TableHead>
                      <TableHead>Expired Date</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {freshnessData.expiredDocuments.map((doc) => (
                      <TableRow key={doc.id} className="bg-red-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">{doc.fileName}</p>
                              <p className="text-sm text-gray-500">{doc.fileType}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {doc.frameworkId && (
                            <Badge variant="outline" className="capitalize">
                              {doc.frameworkId}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {doc.validUntil && format(new Date(doc.validUntil), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
                            {doc.daysOverdue} days
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                              <Zap className="h-4 w-4 mr-1" />
                              Update
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Items */}
      {(summary.expired > 0 || summary.overdue > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.expired > 0 && (
                <p className="text-sm text-orange-700">
                  • {summary.expired} document{summary.expired !== 1 ? 's have' : ' has'} expired and need{summary.expired === 1 ? 's' : ''} to be updated
                </p>
              )}
              {summary.overdue > 0 && (
                <p className="text-sm text-orange-700">
                  • {summary.overdue} document{summary.overdue !== 1 ? 's are' : ' is'} significantly overdue and require{summary.overdue === 1 ? 's' : ''} immediate attention
                </p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                Update Expired Documents
              </Button>
              <Button variant="outline" size="sm">
                Set Freshness Policies
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
