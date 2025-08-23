import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import FrameworkCard from "@/components/framework-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CompanyData {
  name: string;
  industry: string;
  size: string;
  contactEmail: string;
  selectedFrameworks: string[];
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    industry: "",
    size: "",
    contactEmail: "",
    selectedFrameworks: []
  });

  // Initialize frameworks
  const { data: initData } = useQuery({
    queryKey: ["/api/initialize"],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/initialize");
      return response.json();
    }
  });

  const frameworks = initData?.frameworks || [];

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CompanyData) => {
      const response = await apiRequest("POST", "/api/company", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company"] });
      toast({
        title: "Success",
        description: "Company profile created successfully!",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create company profile",
        variant: "destructive",
      });
    },
  });

  const toggleFramework = (frameworkName: string) => {
    setSelectedFrameworks(prev => {
      const newSelection = prev.includes(frameworkName)
        ? prev.filter(f => f !== frameworkName)
        : [...prev, frameworkName];
      
      setCompanyData(prevData => ({
        ...prevData,
        selectedFrameworks: newSelection
      }));
      
      return newSelection;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFrameworks.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one compliance framework",
        variant: "destructive",
      });
      return;
    }

    createCompanyMutation.mutate({
      ...companyData,
      selectedFrameworks
    });
  };

  const estimatedTime = selectedFrameworks.reduce((total, frameworkName) => {
    const framework = frameworks.find((f: any) => f.name === frameworkName);
    return total + (framework?.estimatedTimeMonths || 0);
  }, 0);

  return (
    <>
      <Navigation />
      <div className="pt-16 min-h-screen bg-gradient-to-br from-venzip-primary/10 via-venzip-secondary/5 to-venzip-accent/10">
        <div className="max-w-6xl mx-auto p-6">
          <Card className="glass-card animate-fade-in">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center animate-float shadow-xl">
                  <i className="fas fa-shield-alt text-white text-2xl"></i>
                </div>
                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                  Welcome to <span className="bg-gradient-primary bg-clip-text text-transparent">Venzip</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  AI-powered compliance made simple. Let's get your compliance journey started in just 3 steps.
                </p>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">1</div>
                    <span className="text-sm font-medium text-venzip-primary">Frameworks</span>
                  </div>
                  <div className="w-12 h-px bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">2</div>
                    <span className="text-sm font-medium text-venzip-primary">Company</span>
                  </div>
                  <div className="w-12 h-px bg-gray-300"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">3</div>
                    <span className="text-sm font-medium text-venzip-primary">Setup</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                {/* Framework Selection */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Choose Your Compliance Frameworks</h2>
                  <p className="text-gray-600 text-center mb-8">Select the standards you need to comply with. You can always add more later.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {frameworks.map((framework: any) => (
                      <FrameworkCard
                        key={framework.id}
                        framework={framework}
                        selected={selectedFrameworks.includes(framework.name)}
                        onToggle={() => toggleFramework(framework.name)}
                      />
                    ))}
                  </div>

                  {/* Selection Summary */}
                  {selectedFrameworks.length > 0 && (
                    <div className="glass-card p-6 rounded-xl animate-slide-up" data-testid="selection-summary">
                      <h3 className="text-lg font-semibold mb-4">Selected Frameworks ({selectedFrameworks.length})</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedFrameworks.map(frameworkName => (
                          <span key={frameworkName} className="px-3 py-1 bg-venzip-primary/20 text-venzip-primary text-sm font-medium rounded-full">
                            {frameworkName.toUpperCase()}
                            <button 
                              type="button"
                              onClick={() => toggleFramework(frameworkName)} 
                              className="ml-2 text-venzip-primary/70 hover:text-venzip-primary"
                              data-testid={`remove-framework-${frameworkName}`}
                            >
                              <i className="fas fa-times text-xs"></i>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        Estimated completion time: <span className="font-medium">{estimatedTime} months</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Company Profile Setup */}
                <div className="glass-card p-8 rounded-xl">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">Company Name</Label>
                      <Input 
                        id="companyName"
                        type="text" 
                        placeholder="Enter your company name"
                        value={companyData.name}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        data-testid="input-company-name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">Industry</Label>
                      <Select value={companyData.industry} onValueChange={(value) => setCompanyData(prev => ({ ...prev, industry: value }))}>
                        <SelectTrigger data-testid="select-industry">
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fintech">Financial Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="saas">Software as a Service</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">Company Size</Label>
                      <Select value={companyData.size} onValueChange={(value) => setCompanyData(prev => ({ ...prev, size: value }))}>
                        <SelectTrigger data-testid="select-company-size">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">Primary Contact Email</Label>
                      <Input 
                        id="contactEmail"
                        type="email" 
                        placeholder="contact@company.com"
                        value={companyData.contactEmail}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, contactEmail: e.target.value }))}
                        required
                        data-testid="input-contact-email"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center">
                  <Button 
                    type="submit"
                    disabled={createCompanyMutation.isPending}
                    className="bg-gradient-primary hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold px-8 py-4 rounded-xl"
                    data-testid="button-start-journey"
                  >
                    {createCompanyMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Setting up...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-rocket mr-2"></i>
                        Start Compliance Journey
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
