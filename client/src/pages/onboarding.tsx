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
import { Badge } from "@/components/ui/badge";

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
        title: "🎉 Welcome to Venzip!",
        description: "Your compliance journey starts now. Let's achieve excellence together!",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Setup Failed",
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
        title: "⚠️ Selection Required",
        description: "Please select at least one compliance framework to continue",
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
      
      {/* Background with animated particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/80 to-teal-50/60"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-venzip-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-16 w-96 h-96 bg-venzip-accent/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-venzip-secondary/6 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-4 mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-venzip-primary via-venzip-accent to-venzip-secondary rounded-full flex items-center justify-center shadow-2xl animate-float">
                  <i className="fas fa-shield-alt text-white text-3xl"></i>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-warning-orange to-danger-coral rounded-full flex items-center justify-center animate-pulse">
                  <i className="fas fa-star text-white text-xs"></i>
                </div>
              </div>
            </div>

            <Badge className="mb-6 bg-venzip-primary/10 text-venzip-primary border-venzip-primary/20 px-6 py-3 text-lg font-semibold rounded-full shadow-lg animate-bounce">
              🚀 AI-Powered Setup Wizard
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to
              <br />
              <span className="bg-gradient-to-r from-venzip-primary via-venzip-accent to-venzip-secondary bg-clip-text text-transparent animate-pulse">
                Venzip
              </span>
            </h1>
            
            <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your compliance journey with AI-powered automation. 
              <br />
              <span className="font-semibold text-venzip-primary">Let's get started in just 3 simple steps.</span>
            </p>

            {/* Enhanced Progress Indicator */}
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center space-x-8">
                <div className="flex flex-col items-center space-y-3 group">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                      1
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full opacity-20 blur animate-pulse"></div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-venzip-primary text-lg">Frameworks</div>
                    <div className="text-sm text-gray-500">Choose your standards</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-20 h-1 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full"></div>
                  <i className="fas fa-chevron-right text-venzip-primary mx-2"></i>
                </div>
                
                <div className="flex flex-col items-center space-y-3 group">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-venzip-accent to-venzip-secondary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                      2
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-venzip-accent to-venzip-secondary rounded-full opacity-20 blur animate-pulse delay-500"></div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-venzip-accent text-lg">Company</div>
                    <div className="text-sm text-gray-500">Your information</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-20 h-1 bg-gradient-to-r from-venzip-accent to-venzip-secondary rounded-full"></div>
                  <i className="fas fa-chevron-right text-venzip-accent mx-2"></i>
                </div>
                
                <div className="flex flex-col items-center space-y-3 group">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-venzip-secondary to-success-green rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                      3
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-venzip-secondary to-success-green rounded-full opacity-20 blur animate-pulse delay-1000"></div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-venzip-secondary text-lg">Launch</div>
                    <div className="text-sm text-gray-500">Start your journey</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-16">
            
            {/* Framework Selection Section */}
            <div className="relative">
              <Card className="glass-card border-0 shadow-2xl backdrop-blur-xl bg-white/70">
                <CardContent className="p-12">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full mb-6 shadow-xl">
                      <i className="fas fa-certificate text-white text-2xl"></i>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                      Choose Your <span className="bg-gradient-to-r from-venzip-primary to-venzip-accent bg-clip-text text-transparent">Compliance Frameworks</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Select the regulatory standards your organization needs to comply with. 
                      Our AI will customize your compliance roadmap accordingly.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {frameworks.map((framework: any) => (
                      <div key={framework.id} className="relative group">
                        <FrameworkCard
                          framework={framework}
                          selected={selectedFrameworks.includes(framework.name)}
                          onToggle={() => toggleFramework(framework.name)}
                        />
                        {selectedFrameworks.includes(framework.name) && (
                          <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-success-green to-venzip-primary rounded-full flex items-center justify-center shadow-lg animate-bounce">
                            <i className="fas fa-check text-white text-sm"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Selection Summary */}
                  {selectedFrameworks.length > 0 && (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-venzip-primary/10 via-venzip-accent/10 to-venzip-secondary/10 border border-venzip-primary/20 p-8 animate-slide-up shadow-xl" data-testid="selection-summary">
                      <div className="absolute inset-0 bg-gradient-to-r from-venzip-primary/5 to-venzip-accent/5 blur-xl"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full flex items-center justify-center">
                              <i className="fas fa-chart-pie text-white text-lg"></i>
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900">Your Selection</h3>
                              <p className="text-gray-600">Frameworks chosen for compliance</p>
                            </div>
                          </div>
                          <Badge className="bg-gradient-to-r from-success-green to-venzip-primary text-white px-4 py-2 text-lg font-bold shadow-lg">
                            {selectedFrameworks.length} Selected
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">Selected Frameworks</h4>
                            <div className="flex flex-wrap gap-3">
                              {selectedFrameworks.map(frameworkName => (
                                <div key={frameworkName} className="group relative">
                                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-venzip-primary to-venzip-accent text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                                    {frameworkName.toUpperCase()}
                                    <button 
                                      type="button"
                                      onClick={() => toggleFramework(frameworkName)} 
                                      className="ml-2 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                                      data-testid={`remove-framework-${frameworkName}`}
                                    >
                                      <i className="fas fa-times text-xs"></i>
                                    </button>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">Estimated Timeline</h4>
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-r from-warning-orange to-danger-coral rounded-full flex items-center justify-center shadow-lg">
                                <i className="fas fa-clock text-white text-xl"></i>
                              </div>
                              <div>
                                <div className="text-3xl font-bold bg-gradient-to-r from-warning-orange to-danger-coral bg-clip-text text-transparent">
                                  {estimatedTime} {estimatedTime === 1 ? 'month' : 'months'}
                                </div>
                                <div className="text-sm text-gray-600">Estimated completion time</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center p-4 bg-gradient-to-r from-success-green/10 to-venzip-primary/10 rounded-xl border border-success-green/20">
                          <i className="fas fa-lightbulb text-warning-orange mr-3 text-lg"></i>
                          <span className="text-gray-700 font-medium">AI will customize your roadmap based on these selections</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Company Information Section */}
            <div className="relative">
              <Card className="glass-card border-0 shadow-2xl backdrop-blur-xl bg-white/70">
                <CardContent className="p-12">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-venzip-accent to-venzip-secondary rounded-full mb-6 shadow-xl">
                      <i className="fas fa-building text-white text-2xl"></i>
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-4">
                      Tell Us About Your <span className="bg-gradient-to-r from-venzip-accent to-venzip-secondary bg-clip-text text-transparent">Company</span>
                    </h3>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Help us personalize your compliance experience with some basic information about your organization.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                      <Label htmlFor="companyName" className="block text-lg font-semibold text-gray-800 mb-3 group-hover:text-venzip-primary transition-colors duration-200">
                        <i className="fas fa-building mr-2 text-venzip-primary"></i>
                        Company Name
                      </Label>
                      <div className="relative">
                        <Input 
                          id="companyName"
                          type="text" 
                          placeholder="Enter your company name"
                          value={companyData.name}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="h-14 text-lg border-2 border-gray-200 focus:border-venzip-primary focus:ring-4 focus:ring-venzip-primary/20 rounded-xl shadow-sm transition-all duration-300"
                          data-testid="input-company-name"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-venzip-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                    
                    <div className="group">
                      <Label htmlFor="industry" className="block text-lg font-semibold text-gray-800 mb-3 group-hover:text-venzip-accent transition-colors duration-200">
                        <i className="fas fa-industry mr-2 text-venzip-accent"></i>
                        Industry
                      </Label>
                      <Select value={companyData.industry} onValueChange={(value) => setCompanyData(prev => ({ ...prev, industry: value }))}>
                        <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-venzip-accent focus:ring-4 focus:ring-venzip-accent/20 rounded-xl shadow-sm" data-testid="select-industry">
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-2xl border-0">
                          <SelectItem value="fintech" className="text-lg py-3 rounded-lg hover:bg-venzip-primary/10">
                            <div className="flex items-center space-x-3">
                              <i className="fas fa-coins text-venzip-primary"></i>
                              <span>Financial Technology</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="healthcare" className="text-lg py-3 rounded-lg hover:bg-danger-coral/10">
                            <div className="flex items-center space-x-3">
                              <i className="fas fa-heartbeat text-danger-coral"></i>
                              <span>Healthcare</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="saas" className="text-lg py-3 rounded-lg hover:bg-venzip-accent/10">
                            <div className="flex items-center space-x-3">
                              <i className="fas fa-cloud text-venzip-accent"></i>
                              <span>Software as a Service</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="ecommerce" className="text-lg py-3 rounded-lg hover:bg-warning-orange/10">
                            <div className="flex items-center space-x-3">
                              <i className="fas fa-shopping-cart text-warning-orange"></i>
                              <span>E-commerce</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="other" className="text-lg py-3 rounded-lg hover:bg-gray-100">
                            <div className="flex items-center space-x-3">
                              <i className="fas fa-ellipsis-h text-gray-500"></i>
                              <span>Other</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="group">
                      <Label htmlFor="size" className="block text-lg font-semibold text-gray-800 mb-3 group-hover:text-venzip-secondary transition-colors duration-200">
                        <i className="fas fa-users mr-2 text-venzip-secondary"></i>
                        Company Size
                      </Label>
                      <Select value={companyData.size} onValueChange={(value) => setCompanyData(prev => ({ ...prev, size: value }))}>
                        <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-venzip-secondary focus:ring-4 focus:ring-venzip-secondary/20 rounded-xl shadow-sm" data-testid="select-company-size">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-2xl border-0">
                          <SelectItem value="1-10" className="text-lg py-3 rounded-lg hover:bg-success-green/10">
                            <div className="flex items-center space-x-3">
                              <i className="fas fa-user text-success-green"></i>
                              <span>1-10 employees</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="11-50" className="text-lg py-3 rounded-lg hover:bg-venzip-primary/10">
                            <div className="flex items-center space-x-3">
                              <i className="fas fa-user-friends text-venzip-primary"></i>
                              <span>11-50 employees</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="51-200" className="text-lg py-3 rounded-lg hover:bg-warning-orange/10">
                            <div className="flex items-center space-x-3">
                              <i className="fas fa-users text-warning-orange"></i>
                              <span>51-200 employees</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="201-500" className="text-lg py-3 rounded-lg hover:bg-venzip-accent/10">
                            <div className="flex items-center space-x-3">
                              <i className="fas fa-users-cog text-venzip-accent"></i>
                              <span>201-500 employees</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="500+" className="text-lg py-3 rounded-lg hover:bg-danger-coral/10">
                            <div className="flex items-center space-x-3">
                              <i className="fas fa-city text-danger-coral"></i>
                              <span>500+ employees</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="group">
                      <Label htmlFor="contactEmail" className="block text-lg font-semibold text-gray-800 mb-3 group-hover:text-success-green transition-colors duration-200">
                        <i className="fas fa-envelope mr-2 text-success-green"></i>
                        Primary Contact Email
                      </Label>
                      <div className="relative">
                        <Input 
                          id="contactEmail"
                          type="email" 
                          placeholder="contact@company.com"
                          value={companyData.contactEmail}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, contactEmail: e.target.value }))}
                          required
                          className="h-14 text-lg border-2 border-gray-200 focus:border-success-green focus:ring-4 focus:ring-success-green/20 rounded-xl shadow-sm transition-all duration-300"
                          data-testid="input-contact-email"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-success-green/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Action Button */}
            <div className="text-center">
              <div className="relative inline-block">
                <Button 
                  type="submit"
                  disabled={createCompanyMutation.isPending}
                  className="relative group bg-gradient-to-r from-venzip-primary via-venzip-accent to-venzip-secondary hover:shadow-2xl hover:scale-105 transition-all duration-500 text-white font-bold px-12 py-6 rounded-2xl text-xl overflow-hidden"
                  data-testid="button-start-journey"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-venzip-secondary via-venzip-accent to-venzip-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center space-x-3">
                    {createCompanyMutation.isPending ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Setting up your workspace...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-rocket text-2xl group-hover:animate-bounce"></i>
                        <span>Launch My Compliance Journey</span>
                        <i className="fas fa-arrow-right text-xl group-hover:translate-x-2 transition-transform duration-300"></i>
                      </>
                    )}
                  </div>
                </Button>
                
                {/* Animated background effects */}
                <div className="absolute -inset-4 bg-gradient-to-r from-venzip-primary via-venzip-accent to-venzip-secondary rounded-2xl opacity-20 blur-xl animate-pulse"></div>
              </div>
              
              <p className="mt-6 text-gray-600 text-lg">
                🎯 Your AI-powered compliance dashboard will be ready in seconds!
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}