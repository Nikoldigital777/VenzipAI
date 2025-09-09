import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const reportTypes: ReportType[] = [
  {
    id: 'compliance_summary',
    name: 'Compliance Summary',
    description: 'PDF showing completion status for each framework',
    icon: '📊'
  },
  {
    id: 'task_status',
    name: 'Task Status Report',
    description: 'List of completed, pending, and overdue tasks',
    icon: '✅'
  },
  {
    id: 'executive_summary',
    name: 'Executive Summary',
    description: 'One-page overview with key metrics and AI-generated insights',
    icon: '📈'
  },
  {
    id: 'gap_analysis',
    name: 'Gap Analysis Report',
    description: 'Detailed gap listing with risk assessment and next steps',
    icon: '🎯'
  }
];

export function ReportGenerator() {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast({
        title: "Select Report Type",
        description: "Please select a report type before generating.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: selectedReport
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `${selectedReport}_report.pdf`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Update UI
      const reportName = reportTypes.find(r => r.id === selectedReport)?.name;
      setLastGenerated(reportName || selectedReport);

      toast({
        title: "Report Generated",
        description: `Your ${reportName} has been downloaded successfully.`,
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="glass-card group hover-lift">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-3 text-gray-900">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
            <FileText className="h-6 w-6 text-blue-600 group-hover:animate-bounce" />
          </div>
          <div>
            <div className="text-xl font-bold">PDF Report Generation</div>
            <div className="text-sm text-gray-500 font-normal">Generate professional compliance reports</div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Select Report Type</h4>
          
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger data-testid="select-report-type">
              <SelectValue placeholder="Choose a report to generate..." />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((report) => (
                <SelectItem key={report.id} value={report.id}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{report.icon}</span>
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-xs text-gray-500">{report.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Report Preview */}
        {selectedReport && (
          <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-xl p-4 border border-blue-200/30">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">
                {reportTypes.find(r => r.id === selectedReport)?.icon}
              </span>
              <div>
                <h5 className="font-medium text-blue-800">
                  {reportTypes.find(r => r.id === selectedReport)?.name}
                </h5>
                <p className="text-sm text-blue-600">
                  {reportTypes.find(r => r.id === selectedReport)?.description}
                </p>
              </div>
            </div>
            
            {/* Report Features */}
            <div className="mt-3 space-y-1">
              <p className="text-xs text-blue-700 font-medium">This report includes:</p>
              {selectedReport === 'compliance_summary' && (
                <ul className="text-xs text-blue-600 space-y-1 ml-3">
                  <li>• Framework completion percentages</li>
                  <li>• Overall compliance metrics</li>
                  <li>• Visual progress indicators</li>
                  <li>• Professional formatting</li>
                </ul>
              )}
              {selectedReport === 'task_status' && (
                <ul className="text-xs text-blue-600 space-y-1 ml-3">
                  <li>• Complete task inventory</li>
                  <li>• Status breakdown by category</li>
                  <li>• Overdue task highlights</li>
                  <li>• Priority task listings</li>
                </ul>
              )}
              {selectedReport === 'executive_summary' && (
                <ul className="text-xs text-blue-600 space-y-1 ml-3">
                  <li>• High-level compliance overview</li>
                  <li>• Key performance metrics</li>
                  <li>• AI-generated strategic summary</li>
                  <li>• Executive recommendations</li>
                </ul>
              )}
              {selectedReport === 'gap_analysis' && (
                <ul className="text-xs text-blue-600 space-y-1 ml-3">
                  <li>• Detailed missing requirements</li>
                  <li>• Risk assessment by framework</li>
                  <li>• Prioritized action items</li>
                  <li>• Implementation roadmap</li>
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Reports are generated in real-time with current data
          </div>
          
          <Button
            onClick={handleGenerateReport}
            disabled={!selectedReport || isGenerating}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1 transform transition-all duration-300 font-medium px-6 py-2 group"
            data-testid="button-generate-report"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Generate PDF Report
              </>
            )}
          </Button>
        </div>

        {/* Success Message */}
        {lastGenerated && !isGenerating && (
          <div className="bg-green-50/80 border border-green-200/50 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-700" data-testid="success-message">
              <strong>Success!</strong> {lastGenerated} was generated and downloaded.
            </p>
          </div>
        )}

        {/* Usage Guidelines */}
        <div className="bg-gray-50/80 rounded-lg p-4 border border-gray-200/50">
          <h5 className="font-medium text-gray-900 mb-2 text-sm">📋 Report Usage Guidelines</h5>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>Compliance Summary:</strong> Share with compliance teams for progress tracking</li>
            <li>• <strong>Task Status:</strong> Use for project management and team coordination</li>
            <li>• <strong>Executive Summary:</strong> Present to leadership and stakeholders</li>
            <li>• <strong>Gap Analysis:</strong> Guide remediation efforts and resource allocation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}