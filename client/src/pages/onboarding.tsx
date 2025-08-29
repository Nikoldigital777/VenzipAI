import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  Star, 
  ChevronRight, 
  Award, 
  Building, 
  Factory, 
  PieChart, 
  Check, 
  Clock, 
  Lightbulb,
  X,
  Sparkles,
  Target,
  Rocket,
  DollarSign,
  Heart,
  Cloud,
  ShoppingCart,
  MoreHorizontal,
  Users,
  Mail,
  CheckSquare,
  FolderOpen,
  Settings,
  Bell,
  AlertTriangle,
  TrendingUp,
  Info,
  Calendar,
  Sun
} from "lucide-react";

interface CompanyData {
  name: string;
  industry: string;
  size: string;
  contactEmail: string;
  selectedFrameworks: string[];
}

interface UserPreferences {
  emailNotifications: boolean;
  taskReminders: boolean;
  riskAlerts: boolean;
  weeklyReports: boolean;
  reminderFrequency: string;
}

interface AIChecklist {
  category: string;
  items: {
    id: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    estimatedHours: number;
    description: string;
  }[];
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
  
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    taskReminders: true,
    riskAlerts: true,
    weeklyReports: true,
    reminderFrequency: 'daily'
  });
  
  const [aiChecklist, setAiChecklist] = useState<AIChecklist[]>([]);
  const [isGeneratingChecklist, setIsGeneratingChecklist] = useState(false);
  const [showStep3, setShowStep3] = useState(false);

  // Initialize frameworks
  const { data: initData } = useQuery({
    queryKey: ["/api/initialize"],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/initialize");
      return response.json();
    }
  });

  // Check for existing company profile
  const { data: existingCompany } = useQuery<CompanyData>({
    queryKey: ["/api/company"],
  });

  // Prefill form if company exists
  useEffect(() => {
    if (existingCompany) {
      setCompanyData({
        name: existingCompany.name || "",
        industry: existingCompany.industry || "",
        size: existingCompany.size || "",
        contactEmail: existingCompany.contactEmail || "",
        selectedFrameworks: existingCompany.selectedFrameworks || []
      });
      setSelectedFrameworks(existingCompany.selectedFrameworks || []);
    }
  }, [existingCompany]);

  const frameworks = initData?.frameworks || [];

  const generateChecklistMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/generate-checklist", {
        frameworks: selectedFrameworks,
        industry: companyData.industry,
        companySize: companyData.size
      });
      if (!response.ok) {
        throw new Error("Failed to generate AI checklist");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setAiChecklist(data.checklist || []);
      setShowStep3(true);
      setIsGeneratingChecklist(false);
    },
    onError: (error: Error) => {
      setIsGeneratingChecklist(false);
      toast({
        title: "❌ AI Generation Failed",
        description: error.message || "Failed to generate compliance checklist",
        variant: "destructive",
      });
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CompanyData & { preferences: UserPreferences }) => {
      console.log("Submitting company data:", data);
      const response = await apiRequest("POST", "/api/company", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create company profile");
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Company creation successful:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/company"] });
      toast({
        title: "🎉 Welcome to Venzip!",
        description: "Your compliance journey starts now. Let's achieve excellence together!",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      console.error("Company creation error:", error);
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

  const handleGenerateChecklist = () => {
    // Validate required fields before generating checklist
    if (selectedFrameworks.length === 0) {
      toast({
        title: "⚠️ Framework Selection Required",
        description: "Please select at least one compliance framework to continue",
        variant: "destructive",
      });
      return;
    }

    if (!companyData.industry) {
      toast({
        title: "⚠️ Industry Selection Required",
        description: "Please select your company's industry for personalized recommendations",
        variant: "destructive",
      });
      return;
    }

    if (!companyData.size) {
      toast({
        title: "⚠️ Company Size Required",
        description: "Please select your company size for tailored compliance tasks",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingChecklist(true);
    generateChecklistMutation.mutate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!companyData.name.trim()) {
      toast({
        title: "⚠️ Company Name Required",
        description: "Please enter your company name",
        variant: "destructive",
      });
      return;
    }

    if (!companyData.contactEmail.trim()) {
      toast({
        title: "⚠️ Email Address Required",
        description: "Please enter a valid contact email address",
        variant: "destructive",
      });
      return;
    }

    console.log("Submitting onboarding data:", {
      ...companyData,
      selectedFrameworks,
      preferences: userPreferences
    });

    createCompanyMutation.mutate({
      ...companyData,
      selectedFrameworks,
      preferences: userPreferences
    });
  };

  const estimatedTime = selectedFrameworks.reduce((total, frameworkName) => {
    const framework = frameworks.find((f: any) => f.name === frameworkName);
    return total + (framework?.estimatedTimeMonths || 0);
  }, 0);

  return (
    <>
      
      {/* Background with animated particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/80 to-teal-50/60"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-venzip-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-16 w-96 h-96 bg-venzip-accent/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-venzip-secondary/6 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative pt-8 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Enhanced Hero Section with Floating Elements */}
          <div className="text-center mb-12 relative">
            {/* Floating decorative elements */}
            <div className="absolute -top-10 left-1/4 w-4 h-4 bg-venzip-primary/30 rounded-full animate-float opacity-60" style={{animationDelay: '0s'}}></div>
            <div className="absolute top-20 right-1/3 w-3 h-3 bg-venzip-accent/40 rounded-full animate-float opacity-50" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-32 left-1/6 w-2 h-2 bg-venzip-secondary/50 rounded-full animate-float opacity-70" style={{animationDelay: '4s'}}></div>
            
            <div className="inline-flex items-center justify-center p-4 mb-8 animate-fadeInUp">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-venzip-primary via-venzip-accent to-venzip-secondary rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-all duration-500 animate-pulse"></div>
                <div className="relative w-28 h-28 bg-gradient-to-r from-venzip-primary via-venzip-accent to-venzip-secondary rounded-full flex items-center justify-center shadow-2xl animate-float group-hover:scale-110 transition-transform duration-500">
                  <Shield className="h-14 w-14 text-white" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-warning-orange to-danger-coral rounded-full flex items-center justify-center animate-bounce shadow-lg">
                  <Star className="h-5 w-5 text-white" />
                </div>
                {/* Orbiting particles */}
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-white rounded-full animate-ping opacity-60"></div>
                <div className="absolute bottom-0 right-1/2 w-1.5 h-1.5 bg-venzip-accent rounded-full animate-ping opacity-40" style={{animationDelay: '1s'}}></div>
              </div>
            </div>

            <div className="animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <Badge className="mb-8 bg-gradient-to-r from-venzip-primary/10 via-venzip-accent/10 to-venzip-secondary/10 text-venzip-primary border border-venzip-primary/30 px-8 py-4 text-xl font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-venzip-primary/5 via-venzip-accent/5 to-venzip-secondary/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="relative flex items-center space-x-3">
                  <Rocket className="h-5 w-5 text-venzip-primary animate-bounce" />
                  <span>Enterprise Setup Accelerator</span>
                  <Sparkles className="h-5 w-5 text-venzip-accent animate-pulse" />
                </div>
              </Badge>
            </div>
            
            <div className="animate-fadeInUp" style={{animationDelay: '0.4s'}}>
              <h1 className="text-7xl md:text-8xl font-black text-gray-900 mb-8 leading-tight tracking-tight relative">
                <span className="relative inline-block">
                  Welcome to
                  <div className="absolute -inset-2 bg-gradient-to-r from-venzip-primary/10 to-venzip-accent/10 blur-xl opacity-30 rounded-lg"></div>
                </span>
                <br />
                <span className="relative inline-block group">
                  <span className="bg-gradient-to-r from-venzip-primary via-venzip-accent via-venzip-secondary to-venzip-primary bg-[length:200%_100%] animate-gradient-x bg-clip-text text-transparent font-black">
                    Venzip
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-venzip-primary via-venzip-accent to-venzip-secondary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </span>
              </h1>
            </div>
            
            <div className="animate-fadeInUp" style={{animationDelay: '0.6s'}}>
              <p className="text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
                <span className="font-light">Enterprise-grade compliance platform trusted by</span>
                <br />
                <span className="font-bold bg-gradient-to-r from-venzip-primary to-venzip-accent bg-clip-text text-transparent">Fortune 500 companies.</span>
                <span className="font-light"> Streamline audit readiness in</span>
                <br />
                <span className="font-bold text-venzip-primary text-3xl">3 strategic steps.</span>
              </p>
            </div>

            {/* Enhanced Progress Indicator with 3D Effects */}
            <div className="flex items-center justify-center mb-12 animate-fadeInUp" style={{animationDelay: '0.8s'}}>
              <div className="flex items-center space-x-12 relative">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-venzip-primary/5 via-venzip-accent/5 to-success-green/5 blur-3xl rounded-full"></div>
                
                {/* Step 1 */}
                <div className="flex flex-col items-center space-y-4 group relative">
                  <div className="relative transform perspective-1000 hover:rotate-y-12 transition-all duration-500">
                    <div className="absolute -inset-4 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-all duration-500 animate-pulse"></div>
                    <div className="w-20 h-20 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full flex items-center justify-center text-white font-black text-2xl shadow-2xl group-hover:scale-125 group-hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10 group-hover:text-shadow-lg">1</span>
                      <div className="absolute top-1 left-1 w-3 h-3 bg-white/30 rounded-full animate-ping"></div>
                    </div>
                  </div>
                  <div className="text-center group-hover:scale-105 transition-transform duration-300">
                    <div className="font-bold text-venzip-primary text-xl mb-1 group-hover:text-venzip-accent transition-colors duration-300">Frameworks</div>
                    <div className="text-sm text-gray-600 font-medium">Choose your standards</div>
                  </div>
                  {selectedFrameworks.length > 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-success-green to-venzip-primary rounded-full flex items-center justify-center animate-bounce shadow-lg">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Connector 1 */}
                <div className="flex items-center space-x-3 relative">
                  <div className="w-24 h-2 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full shadow-lg overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-venzip-primary animate-bounce mx-2 drop-shadow-lg" />
                </div>
                
                {/* Step 2 */}
                <div className="flex flex-col items-center space-y-4 group relative">
                  <div className="relative transform perspective-1000 hover:rotate-y-12 transition-all duration-500">
                    <div className="absolute -inset-4 bg-gradient-to-r from-venzip-accent to-venzip-secondary rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-all duration-500 animate-pulse delay-500"></div>
                    <div className="w-20 h-20 bg-gradient-to-r from-venzip-accent to-venzip-secondary rounded-full flex items-center justify-center text-white font-black text-2xl shadow-2xl group-hover:scale-125 group-hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">2</span>
                      <div className="absolute top-1 left-1 w-3 h-3 bg-white/30 rounded-full animate-ping delay-300"></div>
                    </div>
                  </div>
                  <div className="text-center group-hover:scale-105 transition-transform duration-300">
                    <div className="font-bold text-venzip-accent text-xl mb-1 group-hover:text-venzip-secondary transition-colors duration-300">Company</div>
                    <div className="text-sm text-gray-600 font-medium">Your information</div>
                  </div>
                  {companyData.name && companyData.industry && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-success-green to-venzip-accent rounded-full flex items-center justify-center animate-bounce shadow-lg">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Connector 2 */}
                <div className="flex items-center space-x-3 relative">
                  <div className="w-24 h-2 bg-gradient-to-r from-venzip-accent to-venzip-secondary rounded-full shadow-lg overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse delay-1000"></div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-venzip-accent animate-bounce mx-2 drop-shadow-lg" style={{animationDelay: '0.5s'}} />
                </div>
                
                {/* Step 3 */}
                <div className="flex flex-col items-center space-y-4 group relative">
                  <div className="relative transform perspective-1000 hover:rotate-y-12 transition-all duration-500">
                    <div className="absolute -inset-4 bg-gradient-to-r from-venzip-secondary to-success-green rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-all duration-500 animate-pulse delay-1000"></div>
                    <div className="w-20 h-20 bg-gradient-to-r from-venzip-secondary to-success-green rounded-full flex items-center justify-center text-white font-black text-2xl shadow-2xl group-hover:scale-125 group-hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">3</span>
                      <div className="absolute top-1 left-1 w-3 h-3 bg-white/30 rounded-full animate-ping delay-700"></div>
                    </div>
                  </div>
                  <div className="text-center group-hover:scale-105 transition-transform duration-300">
                    <div className="font-bold text-venzip-secondary text-xl mb-1 group-hover:text-success-green transition-colors duration-300">Launch</div>
                    <div className="text-sm text-gray-600 font-medium">Start your journey</div>
                  </div>
                  {showStep3 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-success-green to-venzip-secondary rounded-full flex items-center justify-center animate-bounce shadow-lg">
                      <Rocket className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress bar at bottom */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-venzip-primary via-venzip-accent to-success-green rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${
                      selectedFrameworks.length > 0 && companyData.industry && companyData.size 
                        ? showStep3 ? '100%' : '66%'
                        : selectedFrameworks.length > 0 ? '33%' : '0%'
                    }` 
                  }}
                ></div>
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
                      <Award className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                      Select Your <span className="bg-gradient-to-r from-venzip-primary to-venzip-accent bg-clip-text text-transparent">Regulatory Requirements</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Select the regulatory frameworks critical to your industry. 
                      Our enterprise AI engine will generate a comprehensive compliance roadmap tailored to your organization's risk profile and operational requirements.
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
                            <Check className="h-4 w-4 text-white" />
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
                              <PieChart className="h-6 w-6 text-white" />
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
                                      <X className="h-3 w-3" />
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
                                <Clock className="h-8 w-8 text-white" />
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
                          <Lightbulb className="h-5 w-5 text-warning-orange mr-3" />
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
                      <Building className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-4">
                      Configure Your <span className="bg-gradient-to-r from-venzip-accent to-venzip-secondary bg-clip-text text-transparent">Enterprise Profile</span>
                    </h3>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Establish your organizational profile to enable industry-specific compliance workflows, risk assessments, and regulatory reporting aligned with your business requirements.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                      <Label htmlFor="companyName" className="block text-lg font-semibold text-gray-800 mb-3 group-hover:text-venzip-primary transition-colors duration-200">
                        <Building className="h-4 w-4 mr-2 text-venzip-primary inline" />
                        Organization Name
                      </Label>
                      <div className="relative">
                        <Input 
                          id="companyName"
                          type="text" 
                          placeholder="Enter your organization name"
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
                        <Factory className="h-4 w-4 mr-2 text-venzip-accent inline" />
                        Industry
                      </Label>
                      <Select value={companyData.industry} onValueChange={(value) => setCompanyData(prev => ({ ...prev, industry: value }))}>
                        <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-venzip-accent focus:ring-4 focus:ring-venzip-accent/20 rounded-xl shadow-sm" data-testid="select-industry">
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-2xl border-0">
                          <SelectItem value="fintech" className="text-lg py-3 rounded-lg hover:bg-venzip-primary/10">
                            <div className="flex items-center space-x-3">
                              <DollarSign className="h-4 w-4 text-venzip-primary" />
                              <span>Financial Technology</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="healthcare" className="text-lg py-3 rounded-lg hover:bg-danger-coral/10">
                            <div className="flex items-center space-x-3">
                              <Heart className="h-4 w-4 text-danger-coral" />
                              <span>Healthcare</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="saas" className="text-lg py-3 rounded-lg hover:bg-venzip-accent/10">
                            <div className="flex items-center space-x-3">
                              <Cloud className="h-4 w-4 text-venzip-accent" />
                              <span>Software as a Service</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="ecommerce" className="text-lg py-3 rounded-lg hover:bg-warning-orange/10">
                            <div className="flex items-center space-x-3">
                              <ShoppingCart className="h-4 w-4 text-warning-orange" />
                              <span>E-commerce</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="other" className="text-lg py-3 rounded-lg hover:bg-gray-100">
                            <div className="flex items-center space-x-3">
                              <MoreHorizontal className="h-4 w-4 text-gray-500" />
                              <span>Other</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="group">
                      <Label htmlFor="size" className="block text-lg font-semibold text-gray-800 mb-3 group-hover:text-venzip-secondary transition-colors duration-200">
                        <Users className="h-4 w-4 mr-2 text-venzip-secondary inline" />
                        Company Size
                      </Label>
                      <Select value={companyData.size} onValueChange={(value) => setCompanyData(prev => ({ ...prev, size: value }))}>
                        <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-venzip-secondary focus:ring-4 focus:ring-venzip-secondary/20 rounded-xl shadow-sm" data-testid="select-company-size">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-2xl border-0">
                          <SelectItem value="1-10" className="text-lg py-3 rounded-lg hover:bg-success-green/10">
                            <div className="flex items-center space-x-3">
                              <Building className="h-4 w-4 text-success-green" />
                              <span>1-10 employees</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="11-50" className="text-lg py-3 rounded-lg hover:bg-venzip-primary/10">
                            <div className="flex items-center space-x-3">
                              <Building className="h-4 w-4 text-venzip-primary" />
                              <span>11-50 employees</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="51-200" className="text-lg py-3 rounded-lg hover:bg-warning-orange/10">
                            <div className="flex items-center space-x-3">
                              <Building className="h-4 w-4 text-warning-orange" />
                              <span>51-200 employees</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="201-500" className="text-lg py-3 rounded-lg hover:bg-venzip-accent/10">
                            <div className="flex items-center space-x-3">
                              <Building className="h-4 w-4 text-venzip-accent" />
                              <span>201-500 employees</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="500+" className="text-lg py-3 rounded-lg hover:bg-danger-coral/10">
                            <div className="flex items-center space-x-3">
                              <Building className="h-4 w-4 text-danger-coral" />
                              <span>500+ employees</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="group">
                      <Label htmlFor="contactEmail" className="block text-lg font-semibold text-gray-800 mb-3 group-hover:text-success-green transition-colors duration-200">
                        <Mail className="h-4 w-4 mr-2 text-success-green inline" />
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

            {/* AI Checklist Generation Section */}
            {selectedFrameworks.length > 0 && companyData.industry && companyData.size && !showStep3 && (
              <div className="relative">
                <Card className="glass-card border-0 shadow-2xl backdrop-blur-xl bg-white/70">
                  <CardContent className="p-12 text-center">
                    <div className="mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-6 shadow-xl">
                        <Sparkles className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-4xl font-bold text-gray-900 mb-4">
                        Generate Your <span className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">AI Checklist</span>
                      </h3>
                      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Let our AI create a personalized compliance checklist based on your selected frameworks, industry, and company size.
                      </p>
                    </div>
                    
                    <Button 
                      type="button"
                      onClick={handleGenerateChecklist}
                      disabled={generateChecklistMutation.isPending}
                      className="group relative h-16 px-12 text-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                      data-testid="button-generate-checklist"
                    >
                      <div className="relative flex items-center space-x-4">
                        {generateChecklistMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                            <span>Generating AI Checklist...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-6 w-6" />
                            <span>Generate AI Compliance Checklist</span>
                            <Target className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                          </>
                        )}
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* AI-Generated Checklist Display */}
            {aiChecklist.length > 0 && (
              <div className="relative">
                <Card className="glass-card border-0 shadow-2xl backdrop-blur-xl bg-white/70">
                  <CardContent className="p-12">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-6 shadow-xl">
                        <CheckSquare className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-4xl font-bold text-gray-900 mb-4">
                        Your <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">AI-Generated Checklist</span>
                      </h3>
                      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Personalized compliance tasks based on your specific requirements and industry best practices.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {aiChecklist.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="bg-gray-50/50 rounded-xl p-6">
                          <h4 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FolderOpen className="h-5 w-5 text-emerald-500 mr-3" />
                            {category.category}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {category.items.map((item) => (
                              <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-semibold text-gray-800">{item.title}</h5>
                                  <Badge 
                                    className={`text-xs ${
                                      item.priority === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                      'bg-green-100 text-green-700 border-green-200'
                                    }`}
                                  >
                                    {item.priority} priority
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {item.estimatedHours} hours estimated
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* User Preferences Section */}
            {showStep3 && (
              <div className="relative">
                <Card className="glass-card border-0 shadow-2xl backdrop-blur-xl bg-white/70">
                  <CardContent className="p-12">
                    <div className="text-center mb-12">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6 shadow-xl">
                        <Settings className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-4xl font-bold text-gray-900 mb-4">
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Notification Preferences</span>
                      </h3>
                      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Customize how and when you want to receive compliance updates and reminders.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <h4 className="text-2xl font-semibold text-gray-800 mb-4">Communication Settings</h4>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Mail className="h-4 w-4 text-blue-500" />
                              <div>
                                <Label className="text-lg font-medium text-gray-800">Email Notifications</Label>
                                <p className="text-sm text-gray-600">Receive important compliance updates via email</p>
                              </div>
                            </div>
                            <Switch
                              checked={userPreferences.emailNotifications}
                              onCheckedChange={(checked) => setUserPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                              data-testid="switch-email-notifications"
                            />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Bell className="h-4 w-4 text-green-500" />
                              <div>
                                <Label className="text-lg font-medium text-gray-800">Task Reminders</Label>
                                <p className="text-sm text-gray-600">Get reminded about upcoming compliance tasks</p>
                              </div>
                            </div>
                            <Switch
                              checked={userPreferences.taskReminders}
                              onCheckedChange={(checked) => setUserPreferences(prev => ({ ...prev, taskReminders: checked }))}
                              data-testid="switch-task-reminders"
                            />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <div>
                                <Label className="text-lg font-medium text-gray-800">Risk Alerts</Label>
                                <p className="text-sm text-gray-600">Immediate alerts for high-priority risks</p>
                              </div>
                            </div>
                            <Switch
                              checked={userPreferences.riskAlerts}
                              onCheckedChange={(checked) => setUserPreferences(prev => ({ ...prev, riskAlerts: checked }))}
                              data-testid="switch-risk-alerts"
                            />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <TrendingUp className="h-4 w-4 text-purple-500" />
                              <div>
                                <Label className="text-lg font-medium text-gray-800">Weekly Reports</Label>
                                <p className="text-sm text-gray-600">Comprehensive weekly compliance summaries</p>
                              </div>
                            </div>
                            <Switch
                              checked={userPreferences.weeklyReports}
                              onCheckedChange={(checked) => setUserPreferences(prev => ({ ...prev, weeklyReports: checked }))}
                              data-testid="switch-weekly-reports"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-2xl font-semibold text-gray-800 mb-4">Reminder Settings</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <Label className="text-lg font-semibold text-gray-800 mb-3 block">
                              <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                              Reminder Frequency
                            </Label>
                            <Select 
                              value={userPreferences.reminderFrequency} 
                              onValueChange={(value) => setUserPreferences(prev => ({ ...prev, reminderFrequency: value }))}
                            >
                              <SelectTrigger className="h-12 text-lg border-2 border-gray-200 focus:border-orange-500 rounded-lg" data-testid="select-reminder-frequency">
                                <SelectValue placeholder="Select reminder frequency" />
                              </SelectTrigger>
                              <SelectContent className="rounded-lg shadow-xl">
                                <SelectItem value="daily" className="text-lg py-3 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <Sun className="h-4 w-4 text-yellow-500" />
                                    <span>Daily</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="weekly" className="text-lg py-3 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    <span>Weekly</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="monthly" className="text-lg py-3 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <Calendar className="h-4 w-4 text-green-500" />
                                    <span>Monthly</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                            <h5 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                              <Info className="h-4 w-4 mr-2" />
                              Notification Summary
                            </h5>
                            <div className="space-y-2 text-sm text-blue-700">
                              {userPreferences.emailNotifications && <p>✓ Email notifications enabled</p>}
                              {userPreferences.taskReminders && <p>✓ Task reminders enabled ({userPreferences.reminderFrequency})</p>}
                              {userPreferences.riskAlerts && <p>✓ High-priority risk alerts enabled</p>}
                              {userPreferences.weeklyReports && <p>✓ Weekly compliance reports enabled</p>}
                              {!userPreferences.emailNotifications && !userPreferences.taskReminders && 
                               !userPreferences.riskAlerts && !userPreferences.weeklyReports && (
                                <p className="text-orange-600">⚠️ No notifications enabled</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Final Submit Section */}
            {showStep3 && (
              <div className="relative">
                <Card className="glass-card border-0 shadow-2xl backdrop-blur-xl bg-white/70">
                  <CardContent className="p-12 text-center">
                    <div className="mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-venzip-secondary to-success-green rounded-full mb-6 shadow-xl animate-bounce">
                        <Rocket className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-4xl font-bold text-gray-900 mb-4">
                        Ready to <span className="bg-gradient-to-r from-venzip-secondary to-success-green bg-clip-text text-transparent">Launch</span>?
                      </h3>
                      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Complete your setup and start your compliance journey with AI-powered guidance and personalized workflows.
                      </p>
                    </div>
                    
                    {/* Enhanced Submit Button */}
                    <div className="relative inline-block">
                      <Button 
                        type="submit"
                        disabled={createCompanyMutation.isPending}
                        className="group relative h-16 px-12 text-xl font-bold bg-gradient-to-r from-venzip-primary via-venzip-accent to-venzip-secondary text-white rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 overflow-hidden"
                        data-testid="button-submit-onboarding"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center space-x-4">
                          {createCompanyMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                              <span>Setting up your workspace...</span>
                            </>
                          ) : (
                            <>
                              <span>🚀 Deploy Enterprise Platform</span>
                              <Target className="h-5 w-5 text-white group-hover:translate-x-2 transition-transform duration-300" />
                            </>
                          )}
                        </div>
                      </Button>
                    </div>
                    
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-success-green" />
                        <span>AI-Powered Guidance</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-venzip-primary" />
                        <span>Enterprise Security</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-warning-orange" />
                        <span>24/7 Monitoring</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-venzip-accent" />
                        <span>SOC 2 Certified</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </form>
        </div>
        
        {/* Professional Corporate Footer */}
        <footer className="relative mt-32 bg-gradient-to-b from-slate-900 to-slate-950 text-white">
          {/* Top decorative element */}
          <div className="absolute -top-1 left-0 right-0 h-1 bg-gradient-to-r from-venzip-primary via-venzip-accent to-venzip-secondary"></div>
          
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              
              {/* Company Information */}
              <div className="md:col-span-1">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-lg flex items-center justify-center mr-3">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold">Venzip</span>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Enterprise compliance automation platform trusted by leading organizations worldwide. 
                  Achieve audit readiness faster with AI-powered workflows.
                </p>
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-venzip-primary transition-colors cursor-pointer">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-venzip-primary transition-colors cursor-pointer">
                    <Building className="h-4 w-4" />
                  </div>
                </div>
              </div>
              
              {/* Compliance Frameworks */}
              <div>
                <h3 className="text-lg font-semibold mb-6 text-gray-100">Supported Frameworks</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-venzip-accent mr-3" />
                    <span>SOC 2 Type II</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-venzip-accent mr-3" />
                    <span>ISO 27001</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-venzip-accent mr-3" />
                    <span>HIPAA</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-venzip-accent mr-3" />
                    <span>GDPR</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-venzip-accent mr-3" />
                    <span>PCI DSS</span>
                  </li>
                </ul>
              </div>
              
              {/* Solutions */}
              <div>
                <h3 className="text-lg font-semibold mb-6 text-gray-100">Enterprise Solutions</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="hover:text-venzip-accent cursor-pointer transition-colors">Automated Risk Assessment</li>
                  <li className="hover:text-venzip-accent cursor-pointer transition-colors">Continuous Monitoring</li>
                  <li className="hover:text-venzip-accent cursor-pointer transition-colors">Evidence Management</li>
                  <li className="hover:text-venzip-accent cursor-pointer transition-colors">Audit Coordination</li>
                  <li className="hover:text-venzip-accent cursor-pointer transition-colors">Executive Reporting</li>
                </ul>
              </div>
              
              {/* Contact & Support */}
              <div>
                <h3 className="text-lg font-semibold mb-6 text-gray-100">Enterprise Support</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-venzip-accent mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-gray-200 font-medium">enterprise@venzip.com</div>
                      <div className="text-gray-400 text-sm">Sales & Implementation</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="h-5 w-5 text-venzip-accent mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-gray-200 font-medium">24/7 Support</div>
                      <div className="text-gray-400 text-sm">Dedicated Success Manager</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Settings className="h-5 w-5 text-venzip-accent mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-gray-200 font-medium">Custom Integration</div>
                      <div className="text-gray-400 text-sm">API & SSO Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Trust Indicators & Certifications */}
            <div className="border-t border-gray-800 pt-12 mb-12">
              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-gray-100 mb-6">Trusted by Enterprise Leaders</h3>
                <div className="flex flex-wrap justify-center items-center gap-8">
                  {/* Security Badges */}
                  <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                    <Shield className="h-5 w-5 text-venzip-accent" />
                    <span className="text-sm font-medium text-gray-200">SOC 2 Certified</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                    <Award className="h-5 w-5 text-venzip-accent" />
                    <span className="text-sm font-medium text-gray-200">ISO 27001 Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                    <Cloud className="h-5 w-5 text-venzip-accent" />
                    <span className="text-sm font-medium text-gray-200">GDPR Ready</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                    <Users className="h-5 w-5 text-venzip-accent" />
                    <span className="text-sm font-medium text-gray-200">Enterprise SSO</span>
                  </div>
                </div>
              </div>
              
              {/* Enterprise Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-venzip-accent mb-2">500+</div>
                  <div className="text-gray-300 text-sm">Enterprise Clients</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-venzip-accent mb-2">99.9%</div>
                  <div className="text-gray-300 text-sm">Uptime SLA</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-venzip-accent mb-2">60%</div>
                  <div className="text-gray-300 text-sm">Faster Audit Prep</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-venzip-accent mb-2">24/7</div>
                  <div className="text-gray-300 text-sm">Expert Support</div>
                </div>
              </div>
            </div>
            
            {/* Bottom Footer */}
            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-gray-400 text-sm mb-4 md:mb-0">
                  © 2025 Venzip. All rights reserved. Enterprise Compliance Platform.
                </div>
                <div className="flex space-x-6 text-sm text-gray-400">
                  <a href="#" className="hover:text-venzip-accent transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-venzip-accent transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-venzip-accent transition-colors">Security</a>
                  <a href="#" className="hover:text-venzip-accent transition-colors">Status</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}