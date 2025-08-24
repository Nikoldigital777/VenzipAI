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
  Star
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
              <Star className="h-4 w-4 mr-2 animate-spin group-hover:animate-pulse" />
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
      <section id="frameworks" className="py-24 px-6 bg-gradient-to-br from-gray-50/80 to-white/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-venzip-secondary/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-venzip-accent/10 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight animate-fadeInUp">
              Support for Major <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero animate-gradient-x">Compliance Frameworks</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              Whether you're pursuing SOC 2, ISO 27001, HIPAA, or GDPR compliance, we've got you covered with intelligent automation
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
      <section id="process" className="py-24 px-6 bg-gradient-to-br from-white/90 to-gray-50/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-venzip-primary/10 to-transparent rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-venzip-accent/10 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight animate-fadeInUp">
              Get Compliant in <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero animate-gradient-x">3 Simple Steps</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              Our streamlined process makes compliance accessible for teams of any size with intelligent AI guidance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Lines with animation */}
            <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-1 bg-gradient-to-r from-venzip-primary via-venzip-secondary to-venzip-accent rounded-full shadow-lg animate-gradient-x"></div>
            
            {/* Step 1 */}
            <div className="text-center relative group animate-fadeInUp" style={{animationDelay: '0.3s'}}>
              <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-8 relative z-10 shadow-2xl shadow-venzip-primary/30 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 animate-glow-pulse">
                <span className="text-white text-2xl font-bold group-hover:animate-bounce">1</span>
              </div>
              <div className="glass-card p-8 group-hover:shadow-2xl transition-all duration-500 hover-lift">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 group-hover:text-venzip-primary transition-colors duration-300">Setup Your Profile</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create your company profile, select your target frameworks, and define your compliance goals. 
                  Our AI will customize recommendations based on your industry and company size.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center relative group animate-fadeInUp" style={{animationDelay: '0.4s'}}>
              <div className="w-20 h-20 bg-gradient-warning rounded-3xl flex items-center justify-center mx-auto mb-8 relative z-10 shadow-2xl shadow-warning-orange/30 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                <span className="text-white text-2xl font-bold group-hover:animate-bounce">2</span>
              </div>
              <div className="glass-card p-8 group-hover:shadow-2xl transition-all duration-500 hover-lift">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 group-hover:text-warning-orange transition-colors duration-300">Upload & Analyze</h3>
                <p className="text-gray-600 leading-relaxed">
                  Upload your existing policies and documentation. Our AI analyzes everything, 
                  identifies gaps, and creates a personalized compliance roadmap with prioritized tasks.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center relative group animate-fadeInUp" style={{animationDelay: '0.5s'}}>
              <div className="w-20 h-20 bg-gradient-success rounded-3xl flex items-center justify-center mx-auto mb-8 relative z-10 shadow-2xl shadow-success-green/30 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                <span className="text-white text-2xl font-bold group-hover:animate-bounce">3</span>
              </div>
              <div className="glass-card p-8 group-hover:shadow-2xl transition-all duration-500 hover-lift">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 group-hover:text-success-green transition-colors duration-300">Track & Maintain</h3>
                <p className="text-gray-600 leading-relaxed">
                  Follow your AI-guided roadmap, track progress in real-time, and maintain ongoing compliance 
                  with automated monitoring and continuous improvement recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-50/50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-venzip-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-br from-venzip-accent/10 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="animate-fadeInLeft">
              <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight">
                Why Choose <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero animate-gradient-x">Venzip</span>?
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed font-light">
                Transform your compliance process from a burden into a strategic advantage
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-6 group hover-lift cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-success-green/20 to-success-green/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                    <Clock className="text-success-green h-6 w-6 group-hover:animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-success-green transition-colors duration-300">Save 80% of Time</h4>
                    <p className="text-gray-600 leading-relaxed">Automate tedious compliance tasks and focus on what matters most to your business growth</p>
                  </div>
                </div>

                <div className="flex items-start space-x-6 group hover-lift cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg animate-glow-pulse">
                    <DollarSign className="text-venzip-primary h-6 w-6 group-hover:animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-venzip-primary transition-colors duration-300">Reduce Costs by 60%</h4>
                    <p className="text-gray-600 leading-relaxed">Eliminate expensive consultants and manual processes with intelligent automation</p>
                  </div>
                </div>

                <div className="flex items-start space-x-6 group hover-lift cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-warning-orange/20 to-warning-orange/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                    <BarChart3 className="text-warning-orange h-6 w-6 group-hover:animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-warning-orange transition-colors duration-300">Increase Success Rate</h4>
                    <p className="text-gray-600 leading-relaxed">AI-guided approach ensures you meet all requirements and pass audits on the first try</p>
                  </div>
                </div>

                <div className="flex items-start space-x-6 group hover-lift cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-venzip-accent/20 to-venzip-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                    <ShieldCheck className="text-venzip-accent h-6 w-6 group-hover:animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-venzip-accent transition-colors duration-300">Enterprise Security</h4>
                    <p className="text-gray-600 leading-relaxed">Bank-level encryption and SOC 2 compliant infrastructure protect your sensitive data</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative animate-fadeInRight">
              <div className="absolute inset-0 bg-gradient-to-br from-venzip-primary/10 to-venzip-accent/5 rounded-3xl blur-3xl transform rotate-6"></div>
              <Card className="glass-card relative z-10 hover-lift group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-venzip-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                <CardContent className="p-10 relative z-10">
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-venzip-primary/30 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 animate-glow-pulse">
                      <PieChart className="text-white h-10 w-10 group-hover:animate-pulse" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 group-hover:text-venzip-primary transition-colors duration-300">Real Results</h3>
                    <p className="text-gray-600 mt-2">From companies using Venzip</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center group hover:scale-105 transition-transform duration-300">
                      <div className="text-4xl font-bold text-venzip-primary mb-2 group-hover:animate-bounce">85%</div>
                      <div className="text-sm text-gray-600 font-medium">Time Saved</div>
                    </div>
                    <div className="text-center group hover:scale-105 transition-transform duration-300">
                      <div className="text-4xl font-bold text-success-green mb-2 group-hover:animate-bounce">99%</div>
                      <div className="text-sm text-gray-600 font-medium">Audit Success</div>
                    </div>
                    <div className="text-center group hover:scale-105 transition-transform duration-300">
                      <div className="text-4xl font-bold text-warning-orange mb-2 group-hover:animate-bounce">65%</div>
                      <div className="text-sm text-gray-600 font-medium">Cost Reduction</div>
                    </div>
                    <div className="text-center group hover:scale-105 transition-transform duration-300">
                      <div className="text-4xl font-bold text-venzip-accent mb-2 group-hover:animate-bounce">3x</div>
                      <div className="text-sm text-gray-600 font-medium">Faster Compliance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-6 bg-gradient-hero relative overflow-hidden">
        {/* Enhanced glassmorphism background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/5"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)'
          }}></div>
        </div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h2 className="text-6xl md:text-7xl font-extrabold text-white mb-10 tracking-tight animate-fadeInUp">
            Ready to Transform Your <span className="text-white/90 animate-gradient-x">Compliance?</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-16 max-w-4xl mx-auto leading-relaxed font-light animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            Join hundreds of companies who have streamlined their compliance process with Venzip. 
            Start your journey today and achieve compliance faster than ever before with AI-powered automation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-16 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            <Button 
              onClick={handleLogin}
              size="lg"
              className="glass-morphism-enhanced text-venzip-primary hover:bg-white/90 hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-3 hover:scale-110 transform transition-all duration-500 font-bold px-12 py-6 rounded-2xl text-xl group relative overflow-hidden border border-white/30"
              data-testid="button-login-cta"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <Rocket className="h-6 w-6 mr-3 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
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
              className="bg-white/20 backdrop-blur-xl text-white border-2 border-white/30 hover:bg-white/30 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-3 hover:scale-110 transform transition-all duration-500 font-bold px-12 py-6 rounded-2xl text-xl group"
            >
              <Mail className="h-6 w-6 mr-3 group-hover:animate-bounce" />
              Contact Sales
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 text-white/80 text-base font-medium animate-fadeInUp" style={{animationDelay: '0.6s'}}>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-white/90" />
              <span>Sign in with Replit account</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-white/90" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-white/90" />
              <span>Setup in under 5 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-venzip-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-venzip-accent/5 rounded-full blur-2xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="mb-6">
                <img 
                  src={venzipLogo} 
                  alt="Venzip Logo" 
                  className="h-12 hover:scale-110 transition-transform duration-300"
                  style={{ width: 'auto' }}
                />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                AI-powered compliance platform for modern businesses. 
                Simplify SOC 2, ISO 27001, HIPAA, and GDPR compliance with intelligent automation.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-venzip-primary/20 rounded-full flex items-center justify-center hover:bg-venzip-primary/30 transition-colors duration-300 cursor-pointer group">
                  <ShieldCheck className="h-5 w-5 text-venzip-primary group-hover:animate-bounce" />
                </div>
                <div className="w-10 h-10 bg-venzip-accent/20 rounded-full flex items-center justify-center hover:bg-venzip-accent/30 transition-colors duration-300 cursor-pointer group">
                  <Award className="h-5 w-5 text-venzip-accent group-hover:animate-bounce" />
                </div>
                <div className="w-10 h-10 bg-success-green/20 rounded-full flex items-center justify-center hover:bg-success-green/30 transition-colors duration-300 cursor-pointer group">
                  <CheckCircle className="h-5 w-5 text-success-green group-hover:animate-bounce" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg text-white">Platform</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><a href="#features" className="hover:text-venzip-primary transition-colors duration-300 flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />Features</a></li>
                <li><a href="#frameworks" className="hover:text-venzip-primary transition-colors duration-300 flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />Frameworks</a></li>
                <li><a href="#process" className="hover:text-venzip-primary transition-colors duration-300 flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />How It Works</a></li>
                <li><a href="#" className="hover:text-venzip-primary transition-colors duration-300 flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg text-white">Resources</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><a href="#" className="hover:text-venzip-accent transition-colors duration-300 flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />Documentation</a></li>
                <li><a href="#" className="hover:text-venzip-accent transition-colors duration-300 flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />Compliance Guides</a></li>
                <li><a href="#" className="hover:text-venzip-accent transition-colors duration-300 flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />Best Practices</a></li>
                <li><a href="#" className="hover:text-venzip-accent transition-colors duration-300 flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg text-white">Company</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><a href="#" className="hover:text-success-green transition-colors duration-300 flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />About Us</a></li>
                <li><a href="#" className="hover:text-success-green transition-colors duration-300 flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />Security</a></li>
                <li><a href="#" className="hover:text-success-green transition-colors duration-300 flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />Privacy Policy</a></li>
                <li><a href="mailto:support@venzip.com" className="hover:text-success-green transition-colors duration-300 flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700/50 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                &copy; 2025 Venzip. All rights reserved. Built with ❤️ for compliance teams.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span className="flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4 text-venzip-primary" />
                  <span>SOC 2 Compliant</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-venzip-accent" />
                  <span>Enterprise Grade</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}