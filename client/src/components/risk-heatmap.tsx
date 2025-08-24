import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  Clock,
  Database,
  Users,
  Lock,
  Eye,
  Settings,
  FileText,
  Network,
  Zap
} from "lucide-react";

type ComplianceArea = {
  id: string;
  name: string;
  framework: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  completionRate: number;
  criticalIssues: number;
  description: string;
  icon: any;
};

type HeatmapData = {
  areas: ComplianceArea[];
  overallScore: number;
  frameworkScores: Record<string, number>;
};

export default function RiskHeatmap() {
  const [selectedFramework, setSelectedFramework] = useState<string | undefined>();

  // Fetch heatmap data
  const { data: heatmapData, isLoading } = useQuery<HeatmapData>({
    queryKey: ["/api/risks/heatmap", selectedFramework],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedFramework) params.set("framework", selectedFramework);
      const res = await apiRequest("GET", `/api/risks/heatmap?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load heatmap data");
      return res.json();
    },
  });

  const getRiskColor = (riskLevel: string, riskScore: number) => {
    if (riskLevel === 'high' || riskScore >= 70) {
      return 'bg-red-500 hover:bg-red-600 border-red-600';
    } else if (riskLevel === 'medium' || riskScore >= 40) {
      return 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600';
    } else {
      return 'bg-green-500 hover:bg-green-600 border-green-600';
    }
  };

  const getRiskTextColor = (riskLevel: string, riskScore: number) => {
    if (riskLevel === 'high' || riskScore >= 70) {
      return 'text-red-700';
    } else if (riskLevel === 'medium' || riskScore >= 40) {
      return 'text-yellow-700';
    } else {
      return 'text-green-700';
    }
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Mock compliance areas for demonstration
  const complianceAreas: ComplianceArea[] = heatmapData?.areas || [
    {
      id: 'access-control',
      name: 'Access Control',
      framework: 'ISO 27001',
      riskLevel: 'medium',
      riskScore: 55,
      completionRate: 75,
      criticalIssues: 2,
      description: 'User access management and authentication controls',
      icon: Lock
    },
    {
      id: 'data-protection',
      name: 'Data Protection',
      framework: 'GDPR',
      riskLevel: 'high',
      riskScore: 78,
      completionRate: 60,
      criticalIssues: 4,
      description: 'Personal data processing and protection measures',
      icon: Shield
    },
    {
      id: 'incident-response',
      name: 'Incident Response',
      framework: 'SOC 2',
      riskLevel: 'low',
      riskScore: 25,
      completionRate: 90,
      criticalIssues: 0,
      description: 'Security incident detection and response procedures',
      icon: AlertTriangle
    },
    {
      id: 'network-security',
      name: 'Network Security',
      framework: 'ISO 27001',
      riskLevel: 'medium',
      riskScore: 45,
      completionRate: 80,
      criticalIssues: 1,
      description: 'Network infrastructure protection and monitoring',
      icon: Network
    },
    {
      id: 'data-encryption',
      name: 'Data Encryption',
      framework: 'HIPAA',
      riskLevel: 'low',
      riskScore: 30,
      completionRate: 85,
      criticalIssues: 0,
      description: 'Data encryption at rest and in transit',
      icon: Database
    },
    {
      id: 'user-training',
      name: 'Security Training',
      framework: 'SOC 2',
      riskLevel: 'medium',
      riskScore: 50,
      completionRate: 70,
      criticalIssues: 1,
      description: 'Employee security awareness and training programs',
      icon: Users
    },
    {
      id: 'monitoring',
      name: 'Security Monitoring',
      framework: 'ISO 27001',
      riskLevel: 'high',
      riskScore: 72,
      completionRate: 55,
      criticalIssues: 3,
      description: 'Continuous security monitoring and logging',
      icon: Eye
    },
    {
      id: 'change-management',
      name: 'Change Management',
      framework: 'SOC 2',
      riskLevel: 'low',
      riskScore: 35,
      completionRate: 88,
      criticalIssues: 0,
      description: 'Controlled changes to systems and processes',
      icon: Settings
    },
    {
      id: 'documentation',
      name: 'Documentation',
      framework: 'GDPR',
      riskLevel: 'medium',
      riskScore: 48,
      completionRate: 72,
      criticalIssues: 2,
      description: 'Compliance documentation and record keeping',
      icon: FileText
    },
    {
      id: 'backup-recovery',
      name: 'Backup & Recovery',
      framework: 'HIPAA',
      riskLevel: 'low',
      riskScore: 28,
      completionRate: 92,
      criticalIssues: 0,
      description: 'Data backup and disaster recovery procedures',
      icon: Zap
    }
  ];

  const frameworks = ['ISO 27001', 'SOC 2', 'GDPR', 'HIPAA'];
  const filteredAreas = selectedFramework 
    ? complianceAreas.filter(area => area.framework === selectedFramework)
    : complianceAreas;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Risk Heatmap</h2>
          <p className="text-gray-600 dark:text-gray-300">Visual overview of compliance risks across frameworks</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedFramework(undefined)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !selectedFramework 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Frameworks
          </button>
          {frameworks.map(framework => (
            <button
              key={framework}
              onClick={() => setSelectedFramework(framework)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedFramework === framework 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {framework}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Risk Level Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Low Risk (0-40)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Medium Risk (40-70)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm">High Risk (70-100)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <TooltipProvider>
          {filteredAreas.map((area) => {
            const IconComponent = area.icon;
            return (
              <Tooltip key={area.id}>
                <TooltipTrigger asChild>
                  <Card className={`cursor-pointer transition-all hover:scale-105 border-2 ${getRiskColor(area.riskLevel, area.riskScore)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5 text-white" />
                          <Badge variant="secondary" className="text-xs">
                            {area.framework}
                          </Badge>
                        </div>
                        {area.criticalIssues > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {area.criticalIssues} Critical
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-white mb-2">{area.name}</h3>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white/80 text-sm">Risk Score</span>
                          <span className="text-white font-bold">{area.riskScore}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80 text-sm">Completion</span>
                          <span className="text-white font-semibold">{area.completionRate}%</span>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white rounded-full h-2 transition-all"
                          style={{ width: `${area.completionRate}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs">
                    <p className="font-semibold">{area.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{area.description}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">Framework: <span className="font-medium">{area.framework}</span></p>
                      <p className="text-sm">Risk Level: <span className={`font-medium ${getRiskTextColor(area.riskLevel, area.riskScore)}`}>{area.riskLevel.charAt(0).toUpperCase() + area.riskLevel.slice(1)}</span></p>
                      <p className="text-sm">Completion Rate: <span className={`font-medium ${getCompletionColor(area.completionRate)}`}>{area.completionRate}%</span></p>
                      {area.criticalIssues > 0 && (
                        <p className="text-sm text-red-600">Critical Issues: {area.criticalIssues}</p>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">High Risk Areas</p>
                <p className="text-xl font-bold text-red-600">
                  {filteredAreas.filter(area => area.riskLevel === 'high' || area.riskScore >= 70).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Medium Risk Areas</p>
                <p className="text-xl font-bold text-yellow-600">
                  {filteredAreas.filter(area => area.riskLevel === 'medium' || (area.riskScore >= 40 && area.riskScore < 70)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Low Risk Areas</p>
                <p className="text-xl font-bold text-green-600">
                  {filteredAreas.filter(area => area.riskLevel === 'low' || area.riskScore < 40).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Critical Issues</p>
                <p className="text-xl font-bold text-red-600">
                  {filteredAreas.reduce((sum, area) => sum + area.criticalIssues, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}