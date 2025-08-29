import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Rocket,
  Brain,
  Building2,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  Globe,
  Award,
  MessageCircle,
  Zap,
  Clock,
  Star,
  TrendingUp,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react';
import { useLocation } from 'wouter';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
}

export default function SetupWizard() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    complianceFrameworks: [] as string[],
    primaryGoal: '',
    currentMaturity: '',
    timeline: '',
    budget: '',
    teamSize: '',
    specialRequirements: ''
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const industries = [
    'Technology',
    'Healthcare',
    'Financial Services',
    'Manufacturing',
    'Retail',
    'Education',
    'Government',
    'Other'
  ];

  const companySizes = [
    'Startup (1-10 employees)',
    'Small Business (11-50 employees)',
    'Medium Business (51-200 employees)',
    'Large Enterprise (201-1000 employees)',
    'Enterprise (1000+ employees)'
  ];

  const complianceFrameworks = [
    { id: 'soc2', name: 'SOC 2', description: 'Security, Availability, and Confidentiality' },
    { id: 'iso27001', name: 'ISO 27001', description: 'Information Security Management' },
    { id: 'hipaa', name: 'HIPAA', description: 'Healthcare Data Protection' },
    { id: 'gdpr', name: 'GDPR', description: 'EU Data Privacy Regulation' },
    { id: 'pci', name: 'PCI DSS', description: 'Payment Card Industry Standards' },
    { id: 'nist', name: 'NIST', description: 'Cybersecurity Framework' }
  ];

  const primaryGoals = [
    'Achieve first-time certification',
    'Maintain existing compliance',
    'Expand to new frameworks',
    'Improve security posture',
    'Pass upcoming audit',
    'Enable business growth'
  ];

  const maturityLevels = [
    'Just getting started',
    'Basic policies in place',
    'Some compliance work done',
    'Well-established program',
    'Advanced compliance maturity'
  ];

  const getAIRecommendation = () => {
    const { industry, companySize, complianceFrameworks } = formData;
    
    if (industry === 'Healthcare') {
      return {
        icon: <Shield className="h-5 w-5 text-blue-500" />,
        title: 'HIPAA Focus Recommended',
        description: 'Based on your healthcare industry selection, I recommend prioritizing HIPAA compliance with additional SOC 2 for vendor management.'
      };
    }
    
    if (industry === 'Financial Services') {
      return {
        icon: <Award className="h-5 w-5 text-green-500" />,
        title: 'SOC 2 + PCI DSS Recommended',
        description: 'Financial services typically benefit from SOC 2 for operational security and PCI DSS for payment processing.'
      };
    }
    
    if (companySize.includes('Enterprise')) {
      return {
        icon: <Building2 className="h-5 w-5 text-purple-500" />,
        title: 'Multi-Framework Approach',
        description: 'Large enterprises often need multiple frameworks. Consider starting with SOC 2 and expanding to ISO 27001.'
      };
    }
    
    return {
      icon: <Sparkles className="h-5 w-5 text-venzip-primary" />,
      title: 'SOC 2 Recommended',
      description: 'SOC 2 is an excellent starting point for most technology companies and provides strong security foundations.'
    };
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete setup
      setLocation('/dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFramework = (frameworkId: string) => {
    const current = formData.complianceFrameworks;
    const updated = current.includes(frameworkId)
      ? current.filter(id => id !== frameworkId)
      : [...current, frameworkId];
    updateFormData('complianceFrameworks', updated);
  };

  const steps: WizardStep[] = [
    {
      id: 1,
      title: 'Company Information',
      description: 'Tell us about your organization',
      component: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="companyName" className="text-sm font-semibold text-gray-700">Company Name</Label>
            <Input
              id="companyName"
              placeholder="Enter your company name"
              value={formData.companyName}
              onChange={(e) => updateFormData('companyName', e.target.value)}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="industry" className="text-sm font-semibold text-gray-700">Industry</Label>
            <Select value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="companySize" className="text-sm font-semibold text-gray-700">Company Size</Label>
            <Select value={formData.companySize} onValueChange={(value) => updateFormData('companySize', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                {companySizes.map(size => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Compliance Frameworks',
      description: 'Choose the frameworks you need to implement',
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceFrameworks.map(framework => (
              <Card 
                key={framework.id}
                className={`cursor-pointer transition-all duration-300 hover-lift ${
                  formData.complianceFrameworks.includes(framework.id) 
                    ? 'border-venzip-primary bg-venzip-primary/5' 
                    : 'border-gray-200 hover:border-venzip-primary/50'
                }`}
                onClick={() => toggleFramework(framework.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      checked={formData.complianceFrameworks.includes(framework.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{framework.name}</h3>
                      <p className="text-sm text-gray-600">{framework.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {(formData.industry || formData.companySize) && (
            <Card className="glass-card border-venzip-primary/30 bg-gradient-to-r from-venzip-primary/5 to-venzip-accent/5">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Brain className="text-white h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      {getAIRecommendation().icon}
                      <h4 className="font-semibold text-gray-900">{getAIRecommendation().title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{getAIRecommendation().description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )
    },
    {
      id: 3,
      title: 'Goals & Timeline',
      description: 'Define your compliance objectives',
      component: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="primaryGoal" className="text-sm font-semibold text-gray-700">Primary Goal</Label>
            <Select value={formData.primaryGoal} onValueChange={(value) => updateFormData('primaryGoal', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select your primary goal" />
              </SelectTrigger>
              <SelectContent>
                {primaryGoals.map(goal => (
                  <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="currentMaturity" className="text-sm font-semibold text-gray-700">Current Compliance Maturity</Label>
            <Select value={formData.currentMaturity} onValueChange={(value) => updateFormData('currentMaturity', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select your current maturity level" />
              </SelectTrigger>
              <SelectContent>
                {maturityLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="timeline" className="text-sm font-semibold text-gray-700">Target Timeline</Label>
            <Select value={formData.timeline} onValueChange={(value) => updateFormData('timeline', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="When do you need to be compliant?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Within 3 months</SelectItem>
                <SelectItem value="6months">Within 6 months</SelectItem>
                <SelectItem value="12months">Within 12 months</SelectItem>
                <SelectItem value="flexible">Flexible timeline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Team & Budget',
      description: 'Configure your implementation approach',
      component: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="teamSize" className="text-sm font-semibold text-gray-700">Dedicated Compliance Team Size</Label>
            <Select value={formData.teamSize} onValueChange={(value) => updateFormData('teamSize', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="How many people will work on compliance?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1person">Just me (1 person)</SelectItem>
                <SelectItem value="2-5people">Small team (2-5 people)</SelectItem>
                <SelectItem value="6-15people">Medium team (6-15 people)</SelectItem>
                <SelectItem value="15+people">Large team (15+ people)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="budget" className="text-sm font-semibold text-gray-700">Estimated Budget Range</Label>
            <Select value={formData.budget} onValueChange={(value) => updateFormData('budget', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select your budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under25k">Under $25,000</SelectItem>
                <SelectItem value="25k-75k">$25,000 - $75,000</SelectItem>
                <SelectItem value="75k-200k">$75,000 - $200,000</SelectItem>
                <SelectItem value="200k+">$200,000+</SelectItem>
                <SelectItem value="flexible">Budget flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="specialRequirements" className="text-sm font-semibold text-gray-700">Special Requirements (Optional)</Label>
            <Textarea
              id="specialRequirements"
              placeholder="Any specific compliance requirements, constraints, or goals..."
              value={formData.specialRequirements}
              onChange={(e) => updateFormData('specialRequirements', e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: 'AI Recommendations',
      description: 'Your personalized compliance roadmap',
      component: (
        <div className="space-y-6">
          <Card className="glass-card border-venzip-primary/30 bg-gradient-to-br from-venzip-primary/5 to-venzip-accent/5">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                  <Brain className="text-white h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">AI-Powered Recommendations</CardTitle>
                  <CardDescription>Based on your inputs, here's your personalized compliance roadmap</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 glass-card rounded-xl">
                  <Clock className="h-8 w-8 text-venzip-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">6-9 months</div>
                  <div className="text-sm text-gray-600">Estimated Timeline</div>
                </div>
                <div className="text-center p-4 glass-card rounded-xl">
                  <TrendingUp className="h-8 w-8 text-success-green mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">85%</div>
                  <div className="text-sm text-gray-600">Success Probability</div>
                </div>
                <div className="text-center p-4 glass-card rounded-xl">
                  <Target className="h-8 w-8 text-warning-orange mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">47</div>
                  <div className="text-sm text-gray-600">Recommended Tasks</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 glass-card rounded-xl hover-lift">
                  <div className="w-8 h-8 bg-gradient-success rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-white h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Phase 1: Foundation (Weeks 1-8)</h4>
                    <p className="text-sm text-gray-600 mb-2">Establish core security policies, access controls, and documentation framework.</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Risk Assessment</Badge>
                      <Badge variant="outline" className="text-xs">Policy Development</Badge>
                      <Badge variant="outline" className="text-xs">Access Controls</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 glass-card rounded-xl hover-lift">
                  <div className="w-8 h-8 bg-gradient-warning rounded-full flex items-center justify-center flex-shrink-0">
                    <Settings className="text-white h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Phase 2: Implementation (Weeks 9-20)</h4>
                    <p className="text-sm text-gray-600 mb-2">Deploy security controls, monitoring systems, and compliance processes.</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Security Controls</Badge>
                      <Badge variant="outline" className="text-xs">Monitoring</Badge>
                      <Badge variant="outline" className="text-xs">Training</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 glass-card rounded-xl hover-lift">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="text-white h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Phase 3: Certification (Weeks 21-24)</h4>
                    <p className="text-sm text-gray-600 mb-2">Audit preparation, evidence collection, and certification completion.</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Audit Prep</Badge>
                      <Badge variant="outline" className="text-xs">Evidence Collection</Badge>
                      <Badge variant="outline" className="text-xs">Final Review</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-venzip-primary/10 to-venzip-secondary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-br from-venzip-accent/10 to-success-green/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-br from-venzip-secondary/10 to-venzip-primary/5 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 rounded-full glass-card text-venzip-primary text-sm font-semibold mb-6 border border-venzip-primary/30 shadow-lg hover-glow animate-scale-in group">
            <Brain className="h-4 w-4 mr-2 animate-pulse group-hover:animate-bounce" />
            <span className="text-gradient-primary font-bold">AI-Powered Setup Wizard</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            Let's Build Your
            <span className="block text-gradient-primary bg-clip-text text-transparent bg-gradient-hero animate-gradient-x">
              Compliance Program
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
            Our AI will analyze your requirements and create a personalized compliance roadmap tailored to your organization
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm font-medium text-venzip-primary">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Wizard Content */}
        <Card className="glass-card border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{currentStep}</span>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">{steps[currentStep - 1].title}</CardTitle>
                <CardDescription className="text-gray-600">{steps[currentStep - 1].description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {steps[currentStep - 1].component}
            
            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200">
              <Button
                onClick={handlePrevious}
                variant="outline"
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i + 1}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i + 1 === currentStep
                        ? 'bg-venzip-primary w-6'
                        : i + 1 < currentStep
                        ? 'bg-success-green'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                onClick={handleNext}
                className="bg-gradient-primary hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                <span>{currentStep === totalSteps ? 'Complete Setup' : 'Next'}</span>
                {currentStep === totalSteps ? (
                  <Rocket className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant */}
        <div className="mt-8 text-center">
          <Card className="glass-card border-venzip-primary/30 bg-gradient-to-r from-venzip-primary/5 to-venzip-accent/5 inline-block">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center animate-glow-pulse">
                  <MessageCircle className="text-white h-6 w-6 animate-pulse" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 mb-1">Need Help?</h4>
                  <p className="text-sm text-gray-600">Our AI assistant is analyzing your responses in real-time to provide the best recommendations.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}