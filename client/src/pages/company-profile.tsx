
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  Factory, 
  Users, 
  Mail, 
  Shield, 
  Settings, 
  Bell, 
  Save,
  Edit,
  Check,
  X,
  AlertTriangle,
  Info,
  Calendar,
  Sun,
  DollarSign,
  Heart,
  Cloud,
  ShoppingCart,
  MoreHorizontal,
  FileText,
  TrendingUp,
  Target,
  Clock,
  Award,
  Globe
} from "lucide-react";

interface CompanyData {
  name: string;
  industry: string;
  size: string;
  contactEmail: string;
  selectedFrameworks: string[];
  description?: string;
  website?: string;
  address?: string;
  phone?: string;
  complianceContact?: string;
  securityContact?: string;
}

interface UserPreferences {
  emailNotifications: boolean;
  taskReminders: boolean;
  riskAlerts: boolean;
  weeklyReports: boolean;
  reminderFrequency: string;
  dashboardView: string;
  autoSave: boolean;
  darkMode: boolean;
}

export default function CompanyProfile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    industry: "",
    size: "",
    contactEmail: "",
    selectedFrameworks: [],
    description: "",
    website: "",
    address: "",
    phone: "",
    complianceContact: "",
    securityContact: ""
  });
  
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    taskReminders: true,
    riskAlerts: true,
    weeklyReports: true,
    reminderFrequency: 'daily',
    dashboardView: 'overview',
    autoSave: true,
    darkMode: false
  });

  // Fetch current company data with better error handling
  const { data: existingCompany, isLoading, error: companyError } = useQuery({
    queryKey: ["/api/company"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/company");
      return response.json();
    },
    retry: 2,
    refetchOnMount: true,
    staleTime: 0, // Always fetch fresh data
    onError: (error: any) => {
      console.error("Error fetching company data:", error);
      if (error.message?.includes('401')) {
        console.warn("User not authenticated - company data unavailable");
      }
    }
  });

  // Fetch available frameworks
  const { data: frameworks = [] } = useQuery({
    queryKey: ["/api/frameworks"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/frameworks");
      return response.json();
    }
  });

  // Load existing data
  useEffect(() => {
    if (existingCompany) {
      setCompanyData({
        name: existingCompany.name || "",
        industry: existingCompany.industry || "",
        size: existingCompany.size || "",
        contactEmail: existingCompany.contactEmail || "",
        selectedFrameworks: existingCompany.selectedFrameworks || [],
        description: existingCompany.description || "",
        website: existingCompany.website || "",
        address: existingCompany.address || "",
        phone: existingCompany.phone || "",
        complianceContact: existingCompany.complianceContact || "",
        securityContact: existingCompany.securityContact || ""
      });
    }
  }, [existingCompany]);

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: CompanyData) => {
      const response = await apiRequest("PUT", "/api/company", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update company profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company"] });
      setIsEditing(false);
      toast({
        title: "✅ Profile Updated",
        description: "Your company profile has been successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Update Failed",
        description: error.message || "Failed to update company profile",
        variant: "destructive",
      });
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: UserPreferences) => {
      const response = await apiRequest("PUT", "/api/user/preferences", preferences);
      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Preferences Saved",
        description: "Your notification preferences have been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Update Failed",
        description: error.message || "Failed to update preferences",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    console.log("Saving company data:", companyData);
    
    // Validate required fields
    if (!companyData.name?.trim()) {
      toast({
        title: "❌ Company Name Required",
        description: "Please enter your company name",
        variant: "destructive",
      });
      return;
    }
    
    if (!companyData.contactEmail?.trim()) {
      toast({
        title: "❌ Email Required",
        description: "Please enter a contact email",
        variant: "destructive",
      });
      return;
    }
    
    updateCompanyMutation.mutate(companyData);
  };

  const handleCancel = () => {
    if (existingCompany) {
      setCompanyData({
        name: existingCompany.name || "",
        industry: existingCompany.industry || "",
        size: existingCompany.size || "",
        contactEmail: existingCompany.contactEmail || "",
        selectedFrameworks: existingCompany.selectedFrameworks || [],
        description: existingCompany.description || "",
        website: existingCompany.website || "",
        address: existingCompany.address || "",
        phone: existingCompany.phone || "",
        complianceContact: existingCompany.complianceContact || "",
        securityContact: existingCompany.securityContact || ""
      });
    }
    setIsEditing(false);
  };

  const toggleFramework = (frameworkName: string) => {
    setCompanyData(prev => ({
      ...prev,
      selectedFrameworks: prev.selectedFrameworks.includes(frameworkName)
        ? prev.selectedFrameworks.filter(f => f !== frameworkName)
        : [...prev.selectedFrameworks, frameworkName]
    }));
  };

  const handlePreferencesUpdate = () => {
    updatePreferencesMutation.mutate(userPreferences);
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-venzip-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/80 to-teal-50/60"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-venzip-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-16 w-96 h-96 bg-venzip-accent/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative pt-20 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full mb-6 shadow-xl">
              <Building className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Company <span className="bg-gradient-to-r from-venzip-primary to-venzip-accent bg-clip-text text-transparent">Profile</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage your organization's information, compliance frameworks, and notification preferences
            </p>
          </div>

          <Tabs defaultValue="company" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Company
              </TabsTrigger>
              <TabsTrigger value="frameworks" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Frameworks
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            {/* Company Information Tab */}
            <TabsContent value="company">
              <Card className="glass-card border-0 shadow-2xl backdrop-blur-xl bg-white/70">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Building className="h-6 w-6 text-venzip-primary" />
                      Company Information
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            className="flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={updateCompanyMutation.isPending}
                            className="bg-gradient-to-r from-venzip-primary to-venzip-accent text-white flex items-center gap-2"
                          >
                            {updateCompanyMutation.isPending ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            Save Changes
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="bg-gradient-to-r from-venzip-primary to-venzip-accent text-white flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Info className="h-5 w-5 text-venzip-primary" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="companyName" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Company Name
                        </Label>
                        <Input
                          id="companyName"
                          value={companyData.name}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!isEditing}
                          className="h-12"
                          placeholder="Enter company name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="industry" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Industry
                        </Label>
                        <Select
                          value={companyData.industry}
                          onValueChange={(value) => setCompanyData(prev => ({ ...prev, industry: value }))}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fintech">
                              <div className="flex items-center space-x-3">
                                <DollarSign className="h-4 w-4 text-venzip-primary" />
                                <span>Financial Technology</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="healthcare">
                              <div className="flex items-center space-x-3">
                                <Heart className="h-4 w-4 text-danger-coral" />
                                <span>Healthcare</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="saas">
                              <div className="flex items-center space-x-3">
                                <Cloud className="h-4 w-4 text-venzip-accent" />
                                <span>Software as a Service</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="ecommerce">
                              <div className="flex items-center space-x-3">
                                <ShoppingCart className="h-4 w-4 text-warning-orange" />
                                <span>E-commerce</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="other">
                              <div className="flex items-center space-x-3">
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                <span>Other</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="size" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Company Size
                        </Label>
                        <Select
                          value={companyData.size}
                          onValueChange={(value) => setCompanyData(prev => ({ ...prev, size: value }))}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="h-12">
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
                        <Label htmlFor="website" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Website
                        </Label>
                        <Input
                          id="website"
                          value={companyData.website}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, website: e.target.value }))}
                          disabled={!isEditing}
                          className="h-12"
                          placeholder="https://company.com"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Mail className="h-5 w-5 text-venzip-accent" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="contactEmail" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Primary Email
                        </Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={companyData.contactEmail}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, contactEmail: e.target.value }))}
                          disabled={!isEditing}
                          className="h-12"
                          placeholder="contact@company.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={companyData.phone}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditing}
                          className="h-12"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div>
                        <Label htmlFor="complianceContact" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Compliance Contact
                        </Label>
                        <Input
                          id="complianceContact"
                          type="email"
                          value={companyData.complianceContact}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, complianceContact: e.target.value }))}
                          disabled={!isEditing}
                          className="h-12"
                          placeholder="compliance@company.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="securityContact" className="text-sm font-semibold text-gray-700 mb-2 block">
                          Security Contact
                        </Label>
                        <Input
                          id="securityContact"
                          type="email"
                          value={companyData.securityContact}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, securityContact: e.target.value }))}
                          disabled={!isEditing}
                          className="h-12"
                          placeholder="security@company.com"
                        />
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

            {/* Frameworks Tab */}
            <TabsContent value="frameworks">
              <Card className="glass-card border-0 shadow-2xl backdrop-blur-xl bg-white/70">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Shield className="h-6 w-6 text-venzip-primary" />
                    Compliance Frameworks
                  </CardTitle>
                  <p className="text-gray-600">
                    Manage your organization's compliance framework selections
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {frameworks.map((framework: any) => (
                      <div key={framework.id} className="relative group">
                        <div className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                          companyData.selectedFrameworks.includes(framework.name)
                            ? 'border-venzip-primary bg-venzip-primary/10 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-venzip-primary/50 hover:shadow-md'
                        }`} onClick={() => isEditing && toggleFramework(framework.name)}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                companyData.selectedFrameworks.includes(framework.name)
                                  ? 'bg-venzip-primary text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                <Award className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-gray-900">{framework.displayName}</h3>
                                <p className="text-sm text-gray-600 capitalize">{framework.complexity} complexity</p>
                              </div>
                            </div>
                            {companyData.selectedFrameworks.includes(framework.name) && (
                              <div className="w-6 h-6 bg-venzip-primary rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-4">{framework.description}</p>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">{framework.totalControls} controls</span>
                            <span className="text-gray-500">{framework.estimatedTimeMonths} months</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {companyData.selectedFrameworks.length > 0 && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-venzip-primary/10 to-venzip-accent/10 rounded-xl border border-venzip-primary/20">
                      <h4 className="font-semibold text-gray-800 mb-3">Selected Frameworks</h4>
                      <div className="flex flex-wrap gap-2">
                        {companyData.selectedFrameworks.map(framework => (
                          <Badge key={framework} className="bg-venzip-primary text-white">
                            {framework.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card className="glass-card border-0 shadow-2xl backdrop-blur-xl bg-white/70">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Bell className="h-6 w-6 text-venzip-accent" />
                    Notification Preferences
                  </CardTitle>
                  <p className="text-gray-600">
                    Customize how and when you receive compliance updates
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  
                  {/* Notification Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Types</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-blue-500" />
                          <div>
                            <Label className="text-base font-medium text-gray-800">Email Notifications</Label>
                            <p className="text-sm text-gray-600">Receive compliance updates via email</p>
                          </div>
                        </div>
                        <Switch
                          checked={userPreferences.emailNotifications}
                          onCheckedChange={(checked) => setUserPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-4 w-4 text-green-500" />
                          <div>
                            <Label className="text-base font-medium text-gray-800">Task Reminders</Label>
                            <p className="text-sm text-gray-600">Get reminded about upcoming tasks</p>
                          </div>
                        </div>
                        <Switch
                          checked={userPreferences.taskReminders}
                          onCheckedChange={(checked) => setUserPreferences(prev => ({ ...prev, taskReminders: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <div>
                            <Label className="text-base font-medium text-gray-800">Risk Alerts</Label>
                            <p className="text-sm text-gray-600">Immediate alerts for high-priority risks</p>
                          </div>
                        </div>
                        <Switch
                          checked={userPreferences.riskAlerts}
                          onCheckedChange={(checked) => setUserPreferences(prev => ({ ...prev, riskAlerts: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <TrendingUp className="h-4 w-4 text-purple-500" />
                          <div>
                            <Label className="text-base font-medium text-gray-800">Weekly Reports</Label>
                            <p className="text-sm text-gray-600">Comprehensive weekly summaries</p>
                          </div>
                        </div>
                        <Switch
                          checked={userPreferences.weeklyReports}
                          onCheckedChange={(checked) => setUserPreferences(prev => ({ ...prev, weeklyReports: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Frequency Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Reminder Frequency</h3>
                    <Select 
                      value={userPreferences.reminderFrequency} 
                      onValueChange={(value) => setUserPreferences(prev => ({ ...prev, reminderFrequency: value }))}
                    >
                      <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">
                          <div className="flex items-center space-x-3">
                            <Sun className="h-4 w-4 text-yellow-500" />
                            <span>Daily</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="weekly">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span>Weekly</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="monthly">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-4 w-4 text-green-500" />
                            <span>Monthly</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handlePreferencesUpdate}
                      disabled={updatePreferencesMutation.isPending}
                      className="bg-gradient-to-r from-venzip-accent to-venzip-secondary text-white"
                    >
                      {updatePreferencesMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Preferences
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </>
  );
}
