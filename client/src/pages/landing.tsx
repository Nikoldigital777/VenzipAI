import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Play,
  CheckCircle,
  ShieldCheck,
  Clock,
  Brain,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  FolderOpen,
  MessageCircle,
  Award,
  Globe,
  ShieldAlert,
  Scale,
  DollarSign,
  BarChart3,
  PieChart,
  Mail,
  Sparkles
} from "lucide-react";
import venzipLogo from "@assets/PNG Venzip Logo _edited_1756043677282.png";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 relative overflow-hidden noise-texture">
      {/* Animated glassmorphism background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-venzip-primary/20 to-venzip-secondary/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-br from-venzip-accent/15 to-success-green/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-br from-venzip-secondary/20 to-venzip-primary/15 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-venzip-accent/5 to-transparent rounded-full blur-3xl animate-gradient-x"></div>
      </div>
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism-enhanced border-b border-white/30 shadow-xl"
           style={{
             background: 'rgba(255, 255, 255, 0.1)',
             backdropFilter: 'blur(30px)',
             WebkitBackdropFilter: 'blur(30px)'
           }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={venzipLogo} 
              alt="Venzip Logo" 
              className="h-12"
              style={{ width: 'auto' }}
            />
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-gray-900 transition-colors">Features</button>
            <button onClick={() => scrollToSection('frameworks')} className="text-gray-600 hover:text-gray-900 transition-colors">Frameworks</button>
            <button onClick={() => scrollToSection('process')} className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</button>
            <Button onClick={handleLogin} className="bg-gradient-primary hover:shadow-lg transition-all duration-300">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-8 py-4 rounded-full glass-card text-venzip-primary text-sm font-semibold mb-8 border border-venzip-primary/30 shadow-xl hover-glow animate-scale-in group cursor-pointer">
              <Sparkles className="h-4 w-4 mr-2 animate-spin group-hover:animate-pulse" />
              <span className="text-gradient-primary font-bold">AI-Powered Compliance Platform</span>
              <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight animate-fadeInUp">
              <span className="block">Simplify Your</span>
              <span className="block text-gradient-primary bg-clip-text text-transparent bg-gradient-hero animate-gradient-x hover:scale-105 transition-transform duration-500 cursor-default">
                Compliance Journey
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto font-light">
              Transform complex compliance requirements into manageable workflows. 
              Our cutting-edge AI platform guides you through SOC 2, ISO 27001, HIPAA, and GDPR 
              compliance with intelligent automation and expert insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-16 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
              <Button 
                onClick={handleLogin}
                size="lg"
                className="bg-gradient-hero hover:scale-110 text-white hover:shadow-2xl hover:shadow-venzip-primary/40 hover:-translate-y-3 transform transition-all duration-500 px-12 py-6 rounded-2xl text-xl font-bold shadow-2xl group relative overflow-hidden animate-glow-pulse"
                data-testid="button-login-hero"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <Rocket className="h-6 w-6 mr-3 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Start Your Compliance Journey</span>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => scrollToSection('features')}
                className="glass-card border-2 border-venzip-primary/30 text-gray-700 hover:bg-venzip-primary/10 hover:border-venzip-primary hover:text-venzip-primary hover:shadow-xl hover:-translate-y-2 transform transition-all duration-500 px-10 py-5 rounded-2xl text-xl font-semibold group"
              >
                <Play className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                See How It Works
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success-green" />
                <span>Enterprise-Grade Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-success-green" />
                <span>SOC 2 Compliant Platform</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-success-green" />
                <span>Setup in Minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-white/80 to-gray-50/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-venzip-accent/10 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-br from-venzip-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight">
              Compliance Made <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-to-r from-venzip-primary to-venzip-accent">Intelligent</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
              Our cutting-edge platform combines AI-powered automation with expert guidance to streamline your compliance workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI-Powered Analysis */}
            <Card className="glass-card hover-lift group relative overflow-hidden interactive-card cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-venzip-primary/10 to-venzip-secondary/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-xl shadow-venzip-primary/30 animate-glow-pulse">
                  <Brain className="text-white h-10 w-10 group-hover:animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-venzip-primary transition-colors duration-300">AI Document Analysis</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Upload your policies and procedures. Our advanced AI instantly identifies compliance gaps, 
                  provides intelligent recommendations, and generates improvement suggestions.
                </p>
                <div className="text-sm text-venzip-primary font-semibold flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:rotate-45 transition-transform duration-300" />
                  <span className="text-gradient-primary">Powered by Claude AI</span>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Dashboard */}
            <Card className="glass-card hover-lift group relative overflow-hidden interactive-card cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-warning-orange/10 to-venzip-accent/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-warning rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-xl shadow-warning-orange/30">
                  <TrendingUp className="text-white h-10 w-10 group-hover:animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-warning-orange transition-colors duration-300">Real-time Progress Tracking</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Monitor your compliance journey with interactive dashboards, automated progress tracking, 
                  and visual risk heatmaps that update in real-time.
                </p>
                <div className="text-sm text-warning-orange font-semibold flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:rotate-45 transition-transform duration-300" />
                  Live compliance metrics
                </div>
              </CardContent>
            </Card>

            {/* Risk Management */}
            <Card className="glass-card hover-lift group relative overflow-hidden interactive-card cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-danger-coral/10 to-venzip-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-danger rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-xl shadow-danger-coral/30">
                  <ShieldAlert className="text-white h-10 w-10 group-hover:animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-danger-coral transition-colors duration-300">Intelligent Risk Assessment</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Automatically identify, assess, and prioritize risks across your organization. 
                  Get AI-generated mitigation strategies and track remediation progress.
                </p>
                <div className="text-sm text-danger-coral font-semibold flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:rotate-45 transition-transform duration-300" />
                  Automated risk scoring
                </div>
              </CardContent>
            </Card>

            {/* Task Management */}
            <Card className="glass-card hover-lift group relative overflow-hidden interactive-card cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-success-green/10 to-venzip-accent/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-success rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-xl shadow-success-green/30">
                  <CheckSquare className="text-white h-10 w-10 group-hover:animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-success-green transition-colors duration-300">Smart Task Management</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Organize compliance tasks with automated prioritization, deadline tracking, 
                  and team collaboration features. Never miss critical compliance activities.
                </p>
                <div className="text-sm text-success-green font-semibold flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:rotate-45 transition-transform duration-300" />
                  Automated workflows
                </div>
              </CardContent>
            </Card>

            {/* Document Library */}
            <Card className="glass-card hover-lift group relative overflow-hidden interactive-card cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-venzip-accent/10 to-venzip-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-venzip-accent to-venzip-secondary rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-xl shadow-venzip-accent/30">
                  <FolderOpen className="text-white h-10 w-10 group-hover:animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-venzip-accent transition-colors duration-300">Evidence Library</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Centralize all compliance documentation with automated categorization, 
                  version control, and audit-ready organization across all frameworks.
                </p>
                <div className="text-sm text-venzip-accent font-semibold flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:rotate-45 transition-transform duration-300" />
                  Audit-ready organization
                </div>
              </CardContent>
            </Card>

            {/* AI Chat Assistant */}
            <Card className="glass-card hover-lift group relative overflow-hidden interactive-card cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-info-blue/10 to-venzip-secondary/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-venzip-secondary to-info-blue rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-xl shadow-venzip-secondary/30">
                  <MessageCircle className="text-white h-10 w-10 group-hover:animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-venzip-secondary transition-colors duration-300">24/7 AI Compliance Assistant</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Get instant answers to compliance questions, implementation guidance, 
                  and expert recommendations through our integrated AI chat assistant.
                </p>
                <div className="text-sm text-venzip-secondary font-semibold flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:rotate-45 transition-transform duration-300" />
                  Expert guidance on-demand
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Framework Support Section */}
      <section id="frameworks" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Support for Major <span className="text-gradient-primary">Compliance Frameworks</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're pursuing SOC 2, ISO 27001, HIPAA, or GDPR compliance, we've got you covered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card hover-lift text-center group interactive-card cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-venzip-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 animate-glow-pulse">
                  <Award className="text-venzip-primary h-8 w-8 group-hover:animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-venzip-primary transition-colors duration-300">SOC 2</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Service Organization Control 2 for security, availability, and confidentiality
                </p>
                <Badge className="bg-venzip-primary/10 text-venzip-primary group-hover:bg-venzip-primary group-hover:text-white transition-all duration-300 animate-scale-in">Enterprise Ready</Badge>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift text-center group interactive-card cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-venzip-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-venzip-accent/20 to-venzip-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  <Globe className="text-venzip-accent h-8 w-8 group-hover:animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-venzip-accent transition-colors duration-300">ISO 27001</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  International standard for information security management systems
                </p>
                <Badge className="bg-venzip-accent/10 text-venzip-accent group-hover:bg-venzip-accent group-hover:text-white transition-all duration-300">Global Standard</Badge>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift text-center group interactive-card cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-danger-coral/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-danger-coral/20 to-danger-coral/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  <ShieldAlert className="text-danger-coral h-8 w-8 group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-danger-coral transition-colors duration-300">HIPAA</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Health Insurance Portability and Accountability Act for healthcare data
                </p>
                <Badge className="bg-danger-coral/10 text-danger-coral group-hover:bg-danger-coral group-hover:text-white transition-all duration-300">Healthcare</Badge>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift text-center group interactive-card cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-venzip-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-venzip-secondary/20 to-venzip-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  <Scale className="text-venzip-secondary h-8 w-8 group-hover:animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-venzip-secondary transition-colors duration-300">GDPR</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  General Data Protection Regulation for EU data privacy compliance
                </p>
                <Badge className="bg-venzip-secondary/10 text-venzip-secondary group-hover:bg-venzip-secondary group-hover:text-white transition-all duration-300">EU Privacy</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="process" className="py-20 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Get Compliant in <span className="text-gradient-primary">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our streamlined process makes compliance accessible for teams of any size
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Lines */}
            <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-venzip-primary to-venzip-accent"></div>
            
            {/* Step 1 */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Setup Your Profile</h3>
              <p className="text-gray-600">
                Create your company profile, select your target frameworks, and define your compliance goals. 
                Our AI will customize recommendations based on your industry and company size.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-gradient-warning rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Upload & Analyze</h3>
              <p className="text-gray-600">
                Upload your existing policies and documentation. Our AI analyzes everything, 
                identifies gaps, and creates a personalized compliance roadmap with prioritized tasks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Track & Maintain</h3>
              <p className="text-gray-600">
                Follow your AI-guided roadmap, track progress in real-time, and maintain ongoing compliance 
                with automated monitoring and continuous improvement recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Why Choose <span className="text-gradient-primary">Venzip</span>?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Transform your compliance process from a burden into a strategic advantage
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-success-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Clock className="text-success-green h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Save 80% of Time</h4>
                    <p className="text-gray-600">Automate tedious compliance tasks and focus on what matters most to your business</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-venzip-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <DollarSign className="text-venzip-primary h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Reduce Costs by 60%</h4>
                    <p className="text-gray-600">Eliminate expensive consultants and manual processes with intelligent automation</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-warning-orange/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <BarChart3 className="text-warning-orange h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Increase Success Rate</h4>
                    <p className="text-gray-600">AI-guided approach ensures you meet all requirements and pass audits on the first try</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-venzip-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ShieldCheck className="text-venzip-accent h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Enterprise Security</h4>
                    <p className="text-gray-600">Bank-level encryption and SOC 2 compliant infrastructure protect your sensitive data</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="glass-card">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <PieChart className="text-white h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Real Results</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-venzip-primary mb-2">85%</div>
                      <div className="text-sm text-gray-600">Time Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-success-green mb-2">99%</div>
                      <div className="text-sm text-gray-600">Audit Success</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-warning-orange mb-2">65%</div>
                      <div className="text-sm text-gray-600">Cost Reduction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-venzip-accent mb-2">30%</div>
                      <div className="text-sm text-gray-600">Faster Compliance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-venzip-primary via-venzip-accent to-venzip-secondary relative overflow-hidden">
        {/* Enhanced background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)'
          }}></div>
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
            Ready to Transform Your <span className="text-white/90">Compliance?</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Join hundreds of companies who have streamlined their compliance process with Venzip. 
            Start your journey today and achieve compliance faster than ever before.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-white text-venzip-primary hover:bg-gray-50 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1 transform transition-all duration-500 font-bold px-10 py-5 rounded-2xl text-xl group relative overflow-hidden"
              data-testid="button-login-cta"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <Rocket className="h-6 w-6 mr-3 relative z-10" />
              <span className="relative z-10">Start Free Today</span>
            </Button>
            <Button 
              size="lg"
              onClick={() => {
                try {
                  window.open('mailto:support@venzip.com', '_blank');
                } catch (error) {
                  console.error('Failed to open email client:', error);
                }
              }}
              className="bg-gradient-to-r from-success-green to-success-green/90 text-white border-2 border-success-green hover:from-success-green/90 hover:to-success-green hover:shadow-2xl hover:shadow-success-green/20 hover:-translate-y-1 transform transition-all duration-500 font-bold px-10 py-5 rounded-2xl text-xl"
            >
              <Mail className="h-6 w-6 mr-3" />
              Contact Sales
            </Button>
          </div>

          <p className="text-white/80 text-base font-medium">
            Sign in with your Replit account • No credit card required • Setup in under 5 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <img 
                  src={venzipLogo} 
                  alt="Venzip Logo" 
                  className="h-10"
                  style={{ width: 'auto' }}
                />
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered compliance platform for modern businesses. 
                Simplify SOC 2, ISO 27001, HIPAA, and GDPR compliance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#frameworks" className="hover:text-white transition-colors">Frameworks</a></li>
                <li><a href="#process" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Best Practices</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="mailto:support@venzip.com" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Venzip. All rights reserved. Built with ❤️ for compliance teams.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}