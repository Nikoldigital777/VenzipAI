import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import venzipLogo from "@assets/venzip-logo.png";
import FrameworkCard from "@/components/framework-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Sun,
  FileText,
  ArrowRight,
  ArrowLeft,
  Bot,
  BarChart3,
  CheckCircle,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";


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

// Merging frameworks data from original and edited code, prioritizing edited for new structure
const frameworks: Framework[] = [
  {
    id: "iso27001",
    name: "ISO 27001",
    description: "Information Security Management System (Clauses 4-10)",
    complexity: "Medium",
    estimatedTime: "3-6 months",
    tasksCount: 114,
    icon: Shield,
    color: "from-blue-500 to-blue-600",
    estimatedTimeMonths: 4.5 // Example merge
  },
  {
    id: "hipaa",
    name: "HIPAA Security Rule",
    description: "Healthcare data protection and privacy compliance",
    complexity: "Medium-High",
    estimatedTime: "3-5 months",
    tasksCount: 50,
    icon: FileText,
    color: "from-green-500 to-green-600",
    estimatedTimeMonths: 4 // Example merge
  },
  {
    id: "soc2",
    name: "SOC 2 Type II",
    description: "Trust Services Criteria - Security Controls",
    complexity: "High",
    estimatedTime: "4-6 months",
    tasksCount: 80,
    icon: Lock,
    color: "from-purple-500 to-purple-600",
    estimatedTimeMonths: 5 // Example merge
  },
  {
    id: "scf",
    name: "SCF (Secure Control Framework)",
    description: "Comprehensive cybersecurity control framework",
    complexity: "High",
    estimatedTime: "6+ months",
    tasksCount: 200,
    icon: Target,
    color: "from-orange-500 to-orange-600",
    estimatedTimeMonths: 6 // Example merge
  },
  // Including frameworks from the original code if they are not defined in the edited part or if they are distinct
  // For example, if the original had 'PCI DSS' and it's not in the edited part, we would add it here.
  // Assuming for now that the edited list is comprehensive for the new flow.
];

// Redefining Framework interface to match edited code, while keeping original properties if needed
interface Framework {
  id: string;
  name: string;
  description: string;
  complexity: string;
  estimatedTime: string;
  tasksCount: number;
  icon: any;
  color: string;
  estimatedTimeMonths?: number; // Original property
}

interface ComplianceRequirement {
  id: string;
  frameworkId: string;
  requirementId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
}

interface TaskPreviewProps {
  selectedFrameworks: string[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  handleFinish: () => void;
}

const TaskPreview = ({ selectedFrameworks, currentStep, setCurrentStep, handleFinish }: TaskPreviewProps) => {
    const [sampleTasks, setSampleTasks] = useState<ComplianceRequirement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function fetchSampleTasks() {
        try {
          const res = await fetch('/api/onboarding/preview-tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frameworks: selectedFrameworks }),
          });
          const data = await res.json();
          setSampleTasks(data.tasks || []);
        } catch (error) {
          console.error('Failed to fetch sample tasks:', error);
        } finally {
          setLoading(false);
        }
      }

      if (selectedFrameworks.length > 0) {
        fetchSampleTasks();
      } else {
        setLoading(false);
      }
    }, [selectedFrameworks]);

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Preview of Your Tasks</CardTitle>
          <p className="text-gray-600">
            We've created tasks based on your selected frameworks. Here's a sample of what you'll be working on:
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading your compliance tasks...</span>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {sampleTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition"
                  >
                    <h3 className="font-medium text-gray-800">
                      {task.requirementId} — {task.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 border-indigo-200"
                      >
                        {task.category}
                      </Badge>
                      <Badge 
                        variant={task.priority === 'critical' ? 'destructive' : 
                                task.priority === 'high' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {task.priority} priority
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-lg">Your Complete Compliance Plan</h3>
                </div>
                <p className="text-gray-700 font-semibold mb-4">
                  Total Tasks Generated: 
                  <span className="text-indigo-600 ml-1">
                    {selectedFrameworks.length * 20}+
                  </span>
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Automated task generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Progress tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Risk assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">AI-powered recommendations</span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              onClick={handleFinish}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={loading}
            >
              Complete Setup <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

export default function Onboarding() {
  const [, navigate] = useLocation(); // Changed from setLocation to navigate for clarity
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isReturningUser, setIsReturningUser] = useState(false);
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
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showStep3, setShowStep3] = useState(false); // This state seems to be from the original code, check if still needed.

  // --- State for the new step-by-step flow ---
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [aiEnabled, setAiEnabled] = useState(true); // From edited code for AI assistant setup

  const totalSteps = 6; // Defined in edited code
  const progress = (currentStep / totalSteps) * 100;

  // --- Hooks from original code ---
  const { data: initData } = useQuery({
    queryKey: ["/api/initialize"],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/initialize");
      return response.json();
    }
  });

  const { data: existingCompany } = useQuery<CompanyData>({
    queryKey: ["/api/company"],
    retry: 1,
    refetchOnMount: true,
    staleTime: 0, // Always fetch fresh data
  });

  useEffect(() => {
    if (existingCompany) {
      // Check if user has already completed onboarding
      const hasCompletedOnboarding = !!(
        existingCompany.name && 
        existingCompany.industry && 
        existingCompany.size && 
        existingCompany.contactEmail &&
        existingCompany.selectedFrameworks &&
        existingCompany.selectedFrameworks.length > 0
      );

      if (hasCompletedOnboarding) {
        setIsReturningUser(true);
        toast({
          title: "Welcome back!",
          description: "Your profile is already set up. Redirecting to dashboard...",
        });
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
        return;
      }

      // If not fully completed, populate existing data
      setCompanyData({
        name: existingCompany.name || "",
        industry: existingCompany.industry || "",
        size: existingCompany.size || "",
        contactEmail: existingCompany.contactEmail || "",
        selectedFrameworks: existingCompany.selectedFrameworks || []
      });
      setSelectedFrameworks(existingCompany.selectedFrameworks || []);
    }
  }, [existingCompany, navigate, toast]);

  const frameworksFromInit = initData?.frameworks || []; // Original frameworks data

  // --- Mutations from original code ---
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
      setGenerationProgress(100);
      setTimeout(() => {
        setAiChecklist(data.checklist || []);
        setShowStep3(true); // Check if this is still relevant for the new flow
        setIsGeneratingChecklist(false);
        setGenerationProgress(0); 
      }, 500); 
    },
    onError: (error: Error) => {
      setIsGeneratingChecklist(false);
      setGenerationProgress(0);
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

      if (!data.name?.trim()) throw new Error("Company name is required");
      if (!data.contactEmail?.trim()) throw new Error("Contact email is required");
      if (!data.industry?.trim()) throw new Error("Industry selection is required");
      if (!data.size?.trim()) throw new Error("Company size is required");

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
      navigate("/dashboard"); // Use navigate from useLocation
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

  // --- Handlers and Utilities ---
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    // Ensure all necessary data is present before finishing
    // This might involve validating companyData, selectedFrameworks, and aiEnabled state
    try {
      const response = await fetch("/api/onboarding/complete", { // Using fetch as per edited code
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Assuming token retrieval logic is still needed
          Authorization: `Bearer ${localStorage.getItem("token")}`, 
        },
        body: JSON.stringify({
          company: companyData,
          frameworks: selectedFrameworks,
          aiEnabled,
        }),
      });

      if (response.ok) {
        navigate("/dashboard");
      } else {
        // Handle API error if necessary
        console.error("Onboarding completion API error");
        toast({
          title: "❌ Setup Failed",
          description: "Could not complete onboarding. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Onboarding completion failed:", error);
      toast({
        title: "❌ Setup Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleFramework = (frameworkId: string) => {
    setSelectedFrameworks(prev => 
      prev.includes(frameworkId) 
        ? prev.filter(id => id !== frameworkId)
        : [...prev, frameworkId]
    );
  };

  const getSelectedFrameworksData = () => {
    // Filter the merged frameworks list based on selected IDs
    return frameworks.filter(f => selectedFrameworks.includes(f.id));
  };

  const getTotalTasks = () => {
    return getSelectedFrameworksData().reduce((sum, f) => sum + f.tasksCount, 0);
  };

  const handleGenerateChecklist = () => {
    // Validation from original code
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
    setGenerationProgress(0);

    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95; 
        }
        const increment = Math.random() * 3 + 1; 
        return Math.min(prev + increment, 95);
      });
    }, 800);

    generateChecklistMutation.mutate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation from original code
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

    createCompanyMutation.mutate({
      ...companyData,
      selectedFrameworks: selectedFrameworks, // Use selectedFrameworks state
      preferences: userPreferences
    });
  };

  const estimatedTime = selectedFrameworks.reduce((total, frameworkName) => {
    const framework = frameworks.find((f: any) => f.id === frameworkName); // Use id for lookup
    return total + (framework?.estimatedTimeMonths || 0);
  }, 0);

  // --- Main Render Logic ---
  
  // Show loading for returning users
  if (isReturningUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-venzip-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Your profile is already configured. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-venzip-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-venzip-accent/10 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="glass-morphism border-b border-white/20 shadow-xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <img 
                  src={venzipLogo} 
                  alt="Venzip Logo" 
                  className="h-10"
                  style={{ width: 'auto' }}
                />
              </div>

              {/* Progress */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</div>
                  <div className="text-xs text-gray-400">Setup Progress</div>
                </div>
                <div className="w-32">
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <Card className="glass-card max-w-2xl mx-auto text-center">
                <CardContent className="py-16 px-8">
                  <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-8 animate-glow-pulse">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to VenzipAI
                  </h1>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Let's set up your compliance workspace in just a few steps.
                  </p>
                  <div className="w-64 h-32 bg-gradient-to-br from-venzip-primary/20 to-venzip-accent/20 rounded-2xl mx-auto mb-8 flex items-center justify-center">
                    <Lock className="h-16 w-16 text-venzip-primary opacity-60" />
                  </div>
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-primary text-white hover:shadow-lg hover:shadow-venzip-primary/25 hover:-translate-y-1 transform transition-all duration-300 px-8 py-3"
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Company Profile */}
            {currentStep === 2 && (
              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Building className="h-6 w-6 text-venzip-primary" />
                      Company Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          value={companyData.name}
                          onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                          placeholder="Acme Corporation"
                        />
                      </div>
                      <div>
                        <Label htmlFor="industry">Industry</Label>
                        <Select value={companyData.industry} onValueChange={(value) => setCompanyData({...companyData, industry: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="saas">SaaS</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="size">Company Size</Label>
                        <Select value={companyData.size} onValueChange={(value) => setCompanyData({...companyData, size: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-50">1-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-1000">201-1000 employees</SelectItem>
                            <SelectItem value="1000+">1000+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="contactEmail">Primary Contact Email *</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={companyData.contactEmail}
                          onChange={(e) => setCompanyData({...companyData, contactEmail: e.target.value})}
                          placeholder="john@company.com"
                        />
                      </div>
                      {/* Fields from original code that might be relevant but not in edited step 2 */}
                      {/* E.g., legalEntity, region, contactName, contactRole */}
                      {/* These would need to be integrated if required by the overall flow */}
                    </div>
                  </CardContent>
                </Card>

                {/* Preview Card */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Export Preview</CardTitle>
                    <p className="text-sm text-gray-600">This is how your company will appear in reports</p>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50/50">
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {companyData.name || "Company Name"}
                        </h3>
                        {/* Display other companyData fields if needed */}
                        <div className="space-y-2 text-sm text-gray-500">
                          <div>Industry: {companyData.industry || "Not specified"}</div>
                          <div>Size: {companyData.size || "Not specified"}</div>
                          <div>Contact: {companyData.contactEmail || "Not specified"}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Framework Selection */}
            {currentStep === 3 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Compliance Frameworks</h2>
                  <p className="text-lg text-gray-600">Select the frameworks you want to manage. You can add more later.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {frameworks.map((framework) => {
                    const Icon = framework.icon;
                    const isSelected = selectedFrameworks.includes(framework.id);

                    return (
                      <Card 
                        key={framework.id}
                        className={`glass-card cursor-pointer transition-all duration-300 hover-lift ${
                          isSelected ? 'ring-2 ring-venzip-primary bg-venzip-primary/5' : ''
                        }`}
                        onClick={() => toggleFramework(framework.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${framework.color} rounded-2xl flex items-center justify-center`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            {isSelected && (
                              <CheckCircle className="h-6 w-6 text-venzip-primary" />
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{framework.name}</h3>
                          <p className="text-gray-600 mb-4 text-sm leading-relaxed">{framework.description}</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Complexity:</span>
                              <Badge variant="outline">{framework.complexity}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Estimated Time:</span>
                              <span className="font-medium">{framework.estimatedTime}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Tasks Generated:</span>
                              <span className="font-medium">~{framework.tasksCount} tasks</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Task Preview */}
            {currentStep === 4 && (
              <TaskPreview 
                selectedFrameworks={companyData.selectedFrameworks}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                handleFinish={handleFinish}
              />
            )}

            {/* Step 5: AI Assistant Setup */}
            {currentStep === 5 && (
              <Card className="glass-card max-w-3xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                    <Bot className="h-8 w-8 text-venzip-primary" />
                    Meet your Compliance Assistant
                  </CardTitle>
                  <p className="text-gray-600">
                    Ask questions about ISO, HIPAA, SOC 2, or SCF. Get guidance on controls, evidence, and auditor expectations.
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-xl flex items-center justify-center">
                        <Bot className="h-5 w-5 text-venzip-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Enable AI Compliance Chat & Insights</div>
                        <div className="text-sm text-gray-600">Get intelligent guidance throughout your compliance journey</div>
                      </div>
                    </div>
                    <Switch
                      checked={aiEnabled}
                      onCheckedChange={setAiEnabled}
                    />
                  </div>

                  <div className="bg-gray-900 rounded-lg p-6 text-white">
                    <div className="space-y-4">
                      <div className="text-venzip-primary font-medium">Q: "What evidence should I upload for HIPAA 164.308(a)(1)?"</div>
                      <div className="text-gray-300 pl-4 border-l-2 border-venzip-primary/50">
                        A: "For the Security Management Process, you should upload policies, risk analysis reports, workforce security training logs, and documentation showing designated security responsibilities."
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-venzip-primary/10 rounded-lg">
                      <Users className="h-8 w-8 text-venzip-primary mx-auto mb-2" />
                      <div className="font-medium text-sm">Expert Guidance</div>
                      <div className="text-xs text-gray-600">24/7 compliance expertise</div>
                    </div>
                    <div className="p-4 bg-venzip-accent/10 rounded-lg">
                      <FileText className="h-8 w-8 text-venzip-accent mx-auto mb-2" />
                      <div className="font-medium text-sm">Evidence Recommendations</div>
                      <div className="text-xs text-gray-600">Know what to upload</div>
                    </div>
                    <div className="p-4 bg-venzip-secondary/10 rounded-lg">
                      <Target className="h-8 w-8 text-venzip-secondary mx-auto mb-2" />
                      <div className="font-medium text-sm">Audit Preparation</div>
                      <div className="text-xs text-gray-600">Be ready for auditors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Summary & Finish */}
            {currentStep === 6 && (
              <Card className="glass-card max-w-4xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    Your workspace is ready! 🎉
                  </CardTitle>
                  <p className="text-gray-600">Here's a snapshot of what we've set up for you:</p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Summary Details Card */}
                  <div className="bg-white border rounded-xl shadow-sm p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Company:</span>
                          <span className="font-semibold text-gray-900">{companyData.name || "Not specified"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Industry:</span>
                          <span className="font-semibold text-gray-900">{companyData.industry || "Not specified"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Company Size:</span>
                          <span className="font-semibold text-gray-900">{companyData.size || "Not specified"}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Frameworks:</span>
                          <span className="font-semibold text-gray-900">{selectedFrameworks.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tasks Generated:</span>
                          <span className="font-semibold text-venzip-primary">{getTotalTasks()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">AI Assistant:</span>
                          <Badge variant={aiEnabled ? "default" : "secondary"}>
                            {aiEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Framework Progress Preview */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 text-center">Framework Progress Dashboard Preview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {getSelectedFrameworksData().map((framework) => {
                        const Icon = framework.icon;
                        return (
                          <div
                            key={framework.id}
                            className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex flex-col items-center text-center hover:shadow-md transition-all duration-200"
                          >
                            <div className={`w-16 h-16 bg-gradient-to-br ${framework.color} rounded-2xl flex items-center justify-center mb-4`}>
                              <Icon className="h-8 w-8 text-white" />
                            </div>
                            
                            {/* Progress Ring */}
                            <div className="relative w-20 h-20 mb-3">
                              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                  className="stroke-gray-200"
                                  strokeDasharray="100, 100"
                                  strokeWidth="3"
                                  fill="none"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                  className="stroke-venzip-primary"
                                  strokeDasharray="0, 100"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  fill="none"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-gray-600">0%</span>
                              </div>
                            </div>
                            
                            <p className="text-sm font-medium text-gray-700 mb-1">{framework.name}</p>
                            <p className="text-xs text-gray-500">{framework.tasksCount} tasks</p>
                          </div>
                        );
                      })}
                    </div>
                    
                    {selectedFrameworks.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Shield className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No frameworks selected</p>
                      </div>
                    )}
                  </div>

                  {/* What's Next Preview */}
                  <div className="bg-gradient-to-r from-venzip-primary/10 to-venzip-accent/10 rounded-xl p-6">
                    <h3 className="font-semibold text-lg mb-4 text-center">What's Waiting in Your Dashboard</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <CheckSquare className="h-5 w-5 text-venzip-primary" />
                        <div>
                          <div className="text-sm font-medium">Task Management</div>
                          <div className="text-xs text-gray-600">Track and complete compliance tasks</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-venzip-accent" />
                        <div>
                          <div className="text-sm font-medium">Progress Analytics</div>
                          <div className="text-xs text-gray-600">Monitor your compliance journey</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <Bot className="h-5 w-5 text-venzip-secondary" />
                        <div>
                          <div className="text-sm font-medium">AI Assistant</div>
                          <div className="text-xs text-gray-600">Get instant compliance guidance</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button 
                      onClick={handleFinish}
                      className="bg-gradient-primary text-white hover:shadow-lg hover:shadow-venzip-primary/25 hover:-translate-y-1 transform transition-all duration-300 px-8 py-3 text-lg"
                    >
                      Enter Your Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Navigation Buttons */}
          {currentStep > 1 && (
            <div className="flex justify-between items-center mt-8">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="glass-card border-0 hover:shadow-lg transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              {currentStep < totalSteps && (
                <Button 
                  onClick={handleNext}
                  className="bg-gradient-primary text-white hover:shadow-lg hover:shadow-venzip-primary/25 hover:-translate-y-1 transform transition-all duration-300"
                  disabled={
                    // Validation logic for enabling Next button
                    (currentStep === 2 && (!companyData.name || !companyData.contactEmail)) || 
                    (currentStep === 3 && selectedFrameworks.length === 0)
                    // Add more conditions if other steps have mandatory fields
                  }
                >
                  Next {currentStep === 3 ? "→ Tasks" : currentStep === 4 ? "→ AI Assistant" : currentStep === 5 ? "→ Summary" : "→"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}