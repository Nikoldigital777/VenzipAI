import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Download, Package, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Framework {
  id: string;
  name: string;
  description: string;
}

interface AuditPackage {
  id: string;
  title: string;
  frameworkIds: string[];
  status: "draft" | "generating" | "sealed" | "archived";
  docCount: number;
  sizeBytes: number;
  createdAt: string;
}

export default function AuditPackagesPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [includeEvidence, setIncludeEvidence] = useState(true);
  const [includePolicies, setIncludePolicies] = useState(true);

  // Fetch available frameworks
  const { data: frameworks = [], isLoading: frameworksLoading } = useQuery<Framework[]>({
    queryKey: ["/api/frameworks"],
  });

  // Fetch user's audit packages
  const { data: packages = [], isLoading: packagesLoading } = useQuery<AuditPackage[]>({
    queryKey: ["/api/audit-packages"],
  });

  // Generate audit package mutation
  const generatePackageMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      frameworkIds: string[];
      include: { evidence: boolean; policies: boolean };
    }) => {
      return apiRequest("/api/audit-packages/generate", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Audit package generation started",
        description: "Your audit package is being created. This may take a few minutes.",
      });
      // Reset form
      setTitle("");
      setSelectedFrameworks([]);
      // Refresh packages list
      queryClient.invalidateQueries({ queryKey: ["/api/audit-packages"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate audit package",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  // Handle framework selection
  const handleFrameworkToggle = (frameworkId: string) => {
    setSelectedFrameworks(prev => 
      prev.includes(frameworkId)
        ? prev.filter(id => id !== frameworkId)
        : [...prev, frameworkId]
    );
  };

  // Handle form submission
  const handleGenerate = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your audit package",
        variant: "destructive",
      });
      return;
    }

    if (selectedFrameworks.length === 0) {
      toast({
        title: "Frameworks required",
        description: "Please select at least one compliance framework",
        variant: "destructive",
      });
      return;
    }

    generatePackageMutation.mutate({
      title: title.trim(),
      frameworkIds: selectedFrameworks,
      include: {
        evidence: includeEvidence,
        policies: includePolicies,
      },
    });
  };

  // Handle package download
  const handleDownload = async (packageId: string, packageTitle: string) => {
    try {
      const response = await fetch(`/api/audit-packages/${packageId}/download`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Failed to download package");
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${packageTitle.replace(/[^a-zA-Z0-9]/g, '_')}_audit_package.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: "Your audit package is being downloaded",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the audit package",
        variant: "destructive",
      });
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "sealed":
        return { icon: CheckCircle, color: "text-green-600", label: "Ready" };
      case "generating":
        return { icon: Clock, color: "text-blue-600", label: "Generating" };
      case "draft":
        return { icon: AlertCircle, color: "text-yellow-600", label: "Draft" };
      case "archived":
        return { icon: AlertCircle, color: "text-gray-600", label: "Archived" };
      default:
        return { icon: AlertCircle, color: "text-gray-600", label: status };
    }
  };

  // Get framework names for display
  const getFrameworkNames = (frameworkIds: string[]) => {
    return frameworkIds
      .map(id => frameworks.find((f) => f.id === id)?.name || id)
      .join(", ");
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="audit-packages-page">
      <div className="flex items-center space-x-2">
        <Package className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Audit Package Generator</h1>
      </div>
      
      <p className="text-muted-foreground">
        Generate comprehensive audit packages containing evidence documents and policies for compliance audits.
      </p>

      {/* Generation Form */}
      <Card data-testid="generation-form">
        <CardHeader>
          <CardTitle>Create New Audit Package</CardTitle>
          <CardDescription>
            Select frameworks and configure your audit package contents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Package Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Package Title</Label>
            <Input
              id="title"
              placeholder="e.g., Q4 2024 SOC 2 Audit Package"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-title"
            />
          </div>

          {/* Step 2: Framework Selection */}
          <div className="space-y-3">
            <Label>Compliance Frameworks</Label>
            {frameworksLoading ? (
              <div className="text-sm text-muted-foreground">Loading frameworks...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {frameworks.map((framework) => (
                  <div key={framework.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={framework.id}
                      checked={selectedFrameworks.includes(framework.id)}
                      onCheckedChange={() => handleFrameworkToggle(framework.id)}
                      data-testid={`checkbox-framework-${framework.id}`}
                    />
                    <Label htmlFor={framework.id} className="text-sm font-normal">
                      {framework.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 3: Include Options */}
          <div className="space-y-3">
            <Label>Include in Package</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="evidence"
                  checked={includeEvidence}
                  onCheckedChange={(checked) => setIncludeEvidence(checked === true)}
                  data-testid="checkbox-evidence"
                />
                <Label htmlFor="evidence" className="text-sm font-normal">
                  Evidence Documents
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="policies"
                  checked={includePolicies}
                  onCheckedChange={(checked) => setIncludePolicies(checked === true)}
                  data-testid="checkbox-policies"
                />
                <Label htmlFor="policies" className="text-sm font-normal">
                  Generated Policies
                </Label>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={generatePackageMutation.isPending}
            className="w-full"
            data-testid="button-generate"
          >
            {generatePackageMutation.isPending ? "Generating..." : "Generate Audit Package"}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Existing Packages */}
      <Card data-testid="packages-list">
        <CardHeader>
          <CardTitle>Your Audit Packages</CardTitle>
          <CardDescription>
            Download and manage your generated audit packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {packagesLoading ? (
            <div className="text-center py-6">
              <div className="text-sm text-muted-foreground">Loading packages...</div>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-6">
              <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <div className="text-sm text-muted-foreground">No audit packages created yet</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Frameworks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => {
                  const statusDisplay = getStatusDisplay(pkg.status);
                  const StatusIcon = statusDisplay.icon;
                  
                  return (
                    <TableRow key={pkg.id} data-testid={`package-row-${pkg.id}`}>
                      <TableCell className="font-medium">{pkg.title}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={getFrameworkNames(pkg.frameworkIds)}>
                          {getFrameworkNames(pkg.frameworkIds)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`h-4 w-4 ${statusDisplay.color}`} />
                          <Badge variant={pkg.status === "sealed" ? "default" : "secondary"}>
                            {statusDisplay.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{pkg.docCount}</TableCell>
                      <TableCell>{formatFileSize(pkg.sizeBytes)}</TableCell>
                      <TableCell>{format(new Date(pkg.createdAt), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(pkg.id, pkg.title)}
                          disabled={pkg.status !== "sealed"}
                          data-testid={`button-download-${pkg.id}`}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}