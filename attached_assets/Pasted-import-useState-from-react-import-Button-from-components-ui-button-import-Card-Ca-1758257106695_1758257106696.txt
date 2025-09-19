import { useState } from 'react';
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
  Star,
  Building2,
  Users,
  Target,
  Zap,
  Shield,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Facebook,
  ChevronDown,
  ChevronUp,
  Search,
  FileText,
  Eye,
  Map,
  Monitor,
  BookOpen,
  Upload,
  Download,
  Package,
  HelpCircle,
  Lock,
  User,
  Briefcase
} from "lucide-react";
import venzipLogo from "@assets/venzip-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const [openFramework, setOpenFramework] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: ''
  });

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/onboarding";
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement demo request submission
    console.log('Demo request:', formData);
    alert('Thank you for your interest! We\'ll be in touch soon.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleFramework = (framework: string) => {
    setOpenFramework(openFramework === framework ? null : framework);
  };

  const frameworkDetails = {
    soc2: {
      name: 'SOC 2',
      icon: Award,
      color: 'venzip-primary',
      timeToCompliance: '3-6 months',
      controls: '64 controls',
      description: 'Service Organization Control 2 for security, availability, and confidentiality',
      details: {
        overview: 'SOC 2 is an auditing standard that ensures service providers securely manage data to protect the privacy of their clients.',
        requirements: [
          'Security controls and policies implementation',
          'System availability and performance monitoring',
          'Processing integrity verification',
          'Confidentiality protection measures',
          'Privacy controls for customer data'
        ],
        timeline: [
          'Month 1-2: Gap assessment and policy development',
          'Month 3-4: Control implementation and testing',
          'Month 5-6: Audit preparation and execution'
        ],
        benefits: [
          'Enhanced customer trust and credibility',
          'Competitive advantage in B2B sales',
          'Improved security posture',
          'Regulatory compliance foundation'
        ]
      }
    },
    iso27001: {
      name: 'ISO 27001',
      icon: Globe,
      color: 'venzip-accent',
      timeToCompliance: '6-12 months',
      controls: '114 controls',
      description: 'International standard for information security management systems',
      details: {
        overview: 'ISO 27001 is the global standard for establishing, implementing, maintaining, and improving information security management systems.',
        requirements: [
          'Information Security Management System (ISMS)',
          'Risk assessment and treatment methodology',
          'Security controls across 14 domains',
          'Continuous monitoring and improvement',
          'Management commitment and governance'
        ],
        timeline: [
          'Month 1-3: ISMS framework establishment',
          'Month 4-6: Risk assessment and control implementation',
          'Month 7-9: Internal audits and management review',
          'Month 10-12: Certification audit preparation'
        ],
        benefits: [
          'Global recognition and credibility',
          'Structured approach to information security',
          'Regulatory compliance facilitation',
          'Business process improvement'
        ]
      }
    },
    hipaa: {
      name: 'HIPAA',
      icon: ShieldAlert,
      color: 'danger-coral',
      timeToCompliance: '2-4 months',
      controls: '18 requirements',
      description: 'Health Insurance Portability and Accountability Act for healthcare data',
      details: {
        overview: 'HIPAA establishes national standards for protecting patient health information and ensuring healthcare data privacy.',
        requirements: [
          'Administrative safeguards and policies',
          'Physical safeguards for facilities and equipment',
          'Technical safeguards for electronic PHI',
          'Business associate agreements',
          'Breach notification procedures'
        ],
        timeline: [
          'Month 1: Risk assessment and gap analysis',
          'Month 2: Policy development and staff training',
          'Month 3: Technical controls implementation',
          'Month 4: Documentation and compliance validation'
        ],
        benefits: [
          'Healthcare industry compliance',
          'Patient trust and privacy protection',
          'Reduced risk of data breaches',
          'Avoided regulatory penalties'
        ]
      }
    },
    gdpr: {
      name: 'GDPR',
      icon: Scale,
      color: 'venzip-secondary',
      timeToCompliance: '3-6 months',
      controls: '23 articles',
      description: 'General Data Protection Regulation for EU data privacy compliance',
      details: {
        overview: 'GDPR regulates data protection and privacy for individuals within the European Union and European Economic Area.',
        requirements: [
          'Lawful basis for data processing',
          'Data subject rights implementation',
          'Privacy by design and default',
          'Data protection impact assessments',
          'Breach notification within 72 hours'
        ],
        timeline: [
          'Month 1-2: Data mapping and lawful basis assessment',
          'Month 3-4: Privacy controls and procedures',
          'Month 5-6: Staff training and documentation'
        ],
        benefits: [
          'EU market access and compliance',
          'Enhanced customer privacy protection',
          'Improved data governance',
          'Avoided significant penalties'
        ]
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 relative overflow-hidden noise-texture">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-venzip-primary/20 to-venzip-secondary/15 rounded-full blur-3xl animate-float"></div>
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
              className="h-10"
              style={{ width: 'auto' }}
            />
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('benefits')} className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Benefits</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-gray-900 transition-colors font-medium">How It Works</button>
            <button onClick={() => scrollToSection('demo-form')} className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Demo</button>
            <button onClick={() => scrollToSection('faqs')} className="text-gray-600 hover:text-gray-900 transition-colors font-medium">FAQs</button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome back, {(user as any)?.firstName || user?.email || 'User'}!</span>
                <Button onClick={() => window.location.href = "/dashboard"} className="bg-gradient-primary hover:shadow-lg transition-all duration-300 font-semibold">
                  Dashboard
                </Button>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="glass-card border-0 hover:shadow-lg transition-all duration-300"
                >
                  Sign In
                </Button>
                <Button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-venzip-primary to-venzip-secondary text-white hover:shadow-lg hover:shadow-venzip-primary/25 transition-all duration-300"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
                Get Audit-Ready in <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero">Days — Not Months</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                Venzip makes compliance simple. Our AI-powered platform automates ISO 27001, SOC 2, HIPAA, and more — with dashboards, evidence mapping, and expert guidance built-in.
              </p>

              <Button
                onClick={() => scrollToSection('demo-form')}
                data-testid="button-access-demo"
                className="bg-gradient-to-r from-venzip-primary to-venzip-secondary hover:from-venzip-primary/90 hover:to-venzip-secondary/90 text-white font-semibold px-8 py-4 text-lg rounded-xl hover:shadow-2xl hover:shadow-venzip-primary/30 hover:-translate-y-1 transform transition-all duration-300 flex items-center justify-center"
              >
                <Play className="mr-2 h-5 w-5" />
                Access My Free Demo
              </Button>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/30">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Audit Readiness Dashboard</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                      <div className="text-2xl font-bold text-green-600">89%</div>
                      <div className="text-sm text-green-600">Compliance Score</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">156</div>
                      <div className="text-sm text-blue-600">Evidence Collected</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-600">12</div>
                      <div className="text-sm text-yellow-600">Risks Detected</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">3</div>
                      <div className="text-sm text-purple-600">Frameworks</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-12 px-6 bg-white/50 backdrop-blur-sm border-y border-gray-200/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600 mb-8 font-medium">Trusted by industry leaders worldwide:</p>
          <div className="flex items-center justify-center space-x-12 opacity-70">
            <div className="text-2xl font-bold text-gray-400">Deloitte</div>
            <div className="text-2xl font-bold text-gray-400">Canada Life</div>
            <div className="text-2xl font-bold text-gray-400">HSBC</div>
            <div className="text-2xl font-bold text-gray-400">TELUS</div>
            <div className="text-2xl font-bold text-gray-400">CWB</div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12">Tired of:</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-8 w-8 text-red-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Juggling spreadsheets</h3>
                <p className="text-gray-600">emails, and last-minute audit prep?</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Clock className="h-8 w-8 text-red-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Losing weeks</h3>
                <p className="text-gray-600">collecting policies and logs manually?</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <HelpCircle className="h-8 w-8 text-red-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Not knowing</h3>
                <p className="text-gray-600">if your business is actually audit-ready?</p>
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-4">There's a smarter way.</div>
          <div className="text-3xl font-extrabold text-venzip-primary">Meet Venzip.</div>
        </div>
      </section>

      {/* Core Benefits Section */}
      <section id="benefits" className="py-24 px-6 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight">
              Venzip automates the <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero animate-gradient-x">hardest parts</span> of compliance:
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-12">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Automated Evidence Collection</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Connect your tech stack. Venzip gathers, organizes, and tags documents for audits automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Brain className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Risk Engine</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Detect risks before auditors do. Continuous monitoring reduces blind spots.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Map className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Framework Mapper</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Map policies and controls across multiple standards at once — ISO, SOC 2, HIPAA, GDPR. No duplicate work.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Monitor className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Dashboards</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Track progress, pending tasks, and evidence in one place. Always know your audit readiness score.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Button
              onClick={() => scrollToSection('how-it-works')}
              data-testid="button-see-how-it-works"
              className="bg-gradient-to-r from-venzip-primary to-venzip-secondary hover:from-venzip-primary/90 hover:to-venzip-secondary/90 text-white font-semibold px-8 py-4 text-lg rounded-xl hover:shadow-2xl hover:shadow-venzip-primary/30 hover:-translate-y-1 transform transition-all duration-300 flex items-center justify-center"
            >
              <ArrowRight className="mr-2 h-5 w-5" />
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight">
              <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero">How It Works</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-10 w-10 text-venzip-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">1. Onboard</h3>
              <p className="text-gray-600">Add company details & select frameworks.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-venzip-secondary/20 to-venzip-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Map className="h-10 w-10 text-venzip-secondary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">2. Map Controls</h3>
              <p className="text-gray-600">AI generates a tailored compliance task list.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-venzip-accent/20 to-venzip-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="h-10 w-10 text-venzip-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">3. Collect Evidence</h3>
              <p className="text-gray-600">Auto-sync or upload documentation.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-success-green/20 to-success-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-success-green" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">4. Get Audit-Ready</h3>
              <p className="text-gray-600">Export an auditor-friendly package instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 px-6 bg-venzip-primary/5 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-12 shadow-2xl border border-venzip-primary/10">
            <div className="mb-8">
              <div className="flex justify-center space-x-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl text-gray-700 leading-relaxed italic">
                "Our compliance process was scattered across spreadsheets and departments, making audits a nightmare. Venzip centralized everything and gave us real-time visibility into our risk posture."
              </blockquote>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-right">
                <div className="font-semibold text-gray-900">— Compliance Director</div>
                <div className="text-gray-600">Global Tech Company</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-white/80 to-gray-50/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight">
              Compliance Made <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-to-r from-venzip-primary to-venzip-accent">Intelligent</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              Advanced AI automation combined with expert guidance to transform your compliance workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI-Powered Analysis */}
            <Card className="glass-card hover-lift group relative overflow-hidden interactive-card cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-venzip-primary/10 to-venzip-secondary/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
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

      {/* ROI Metrics Section */}
      <section id="roi-metrics" className="py-24 px-6 bg-gradient-to-br from-white/95 to-gray-50/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight">
              Proven <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero animate-gradient-x">Business Impact</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Quantifiable results from enterprises using Venzip for compliance automation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="glass-card hover-lift group text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-success-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-success rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-success-green/30">
                  <Target className="text-white h-8 w-8" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-success-green transition-colors duration-300">87%</div>
                <p className="text-gray-700 font-medium">Faster Compliance</p>
                <p className="text-gray-500 text-sm mt-2">Average time to certification</p>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift group text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-warning-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-warning rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-warning-orange/30">
                  <DollarSign className="text-white h-8 w-8" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-warning-orange transition-colors duration-300">$2.3M</div>
                <p className="text-gray-700 font-medium">Average Cost Savings</p>
                <p className="text-gray-500 text-sm mt-2">Per compliance program</p>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift group text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-danger-coral/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-danger rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-danger-coral/30">
                  <Zap className="text-white h-8 w-8" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-danger-coral transition-colors duration-300">95%</div>
                <p className="text-gray-700 font-medium">Risk Reduction</p>
                <p className="text-gray-500 text-sm mt-2">In compliance gaps</p>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift group text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-venzip-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-venzip-primary/30 animate-glow-pulse">
                  <BarChart3 className="text-white h-8 w-8" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-venzip-primary transition-colors duration-300">340%</div>
                <p className="text-gray-700 font-medium">ROI Average</p>
                <p className="text-gray-500 text-sm mt-2">Within first year</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enterprise Features Section */}
      <section id="enterprise" className="py-24 px-6 bg-gradient-to-br from-white/95 to-gray-50/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight">
              Built for <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero">Enterprise Scale</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Advanced features and enterprise-grade security for organizations of all sizes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-8">
              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="text-white h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Advanced Security & Privacy</h3>
                  <p className="text-gray-600 leading-relaxed">Enterprise-grade encryption, RBAC, SSO integration, and comprehensive audit trails. SOC 2 Type II certified infrastructure.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Users className="text-white h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Team Collaboration</h3>
                  <p className="text-gray-600 leading-relaxed">Multi-tenant architecture, role-based permissions, workflow approvals, and real-time collaboration across departments.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group">
                <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="text-white h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Executive Reporting</h3>
                  <p className="text-gray-600 leading-relaxed">C-level dashboards, automated compliance reports, risk analytics, and customizable KPI tracking for board presentations.</p>
                </div>
              </div>
            </div>

            <Card className="glass-card hover-lift p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-venzip-primary/5 to-venzip-accent/5"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Enterprise Support</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success-green" />
                    <span className="text-gray-700">Dedicated Customer Success Manager</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success-green" />
                    <span className="text-gray-700">24/7 Priority Support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success-green" />
                    <span className="text-gray-700">Custom Integration Support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success-green" />
                    <span className="text-gray-700">On-site Implementation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success-green" />
                    <span className="text-gray-700">Compliance Advisory Services</span>
                  </div>
                </div>
                <Button
                  onClick={handleLogin}
                  className="mt-6 w-full bg-gradient-primary hover:shadow-lg transition-all duration-300"
                >
                  Contact Enterprise Sales
                </Button>
              </div>
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
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight animate-fadeInUp">
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

      {/* Enterprise ROI Section */}
      <section id="roi-metrics" className="py-24 px-6 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Proven <span className="text-venzip-primary">Enterprise Results</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Quantifiable compliance ROI for enterprise organizations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="glass-card text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-venzip-primary mb-2">$2.3M</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">Average Cost Savings</div>
                <div className="text-sm text-gray-600">Per compliance program annually</div>
              </CardContent>
            </Card>
            <Card className="glass-card text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-success-green mb-2">75%</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">Faster Audit Prep</div>
                <div className="text-sm text-gray-600">Reduced audit preparation time</div>
              </CardContent>
            </Card>
            <Card className="glass-card text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-warning-orange mb-2">98%</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">First-Time Pass Rate</div>
                <div className="text-sm text-gray-600">Successful audit outcomes</div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Enterprise Cost Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Traditional Approach</h4>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex justify-between"><span>External consultants</span><span className="font-medium">$150K - $300K</span></li>
                    <li className="flex justify-between"><span>Internal resource time</span><span className="font-medium">$200K - $400K</span></li>
                    <li className="flex justify-between"><span>Tool licensing</span><span className="font-medium">$50K - $100K</span></li>
                    <li className="flex justify-between"><span>Audit failures/delays</span><span className="font-medium">$100K - $500K</span></li>
                    <li className="border-t pt-3 flex justify-between font-bold"><span>Total Annual Cost</span><span className="text-danger-coral">$500K - $1.3M</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Venzip Platform</h4>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex justify-between"><span>Platform subscription</span><span className="font-medium">$120K - $200K</span></li>
                    <li className="flex justify-between"><span>Reduced internal time</span><span className="font-medium">$50K - $100K</span></li>
                    <li className="flex justify-between"><span>Minimal consulting</span><span className="font-medium">$25K - $50K</span></li>
                    <li className="flex justify-between"><span>Audit success rate</span><span className="font-medium">$0 - $25K</span></li>
                    <li className="border-t pt-3 flex justify-between font-bold"><span>Total Annual Cost</span><span className="text-success-green">$195K - $375K</span></li>
                  </ul>
                </div>
              </div>
              <div className="text-center mt-8 p-6 bg-success-green/10 rounded-xl">
                <div className="text-2xl font-bold text-success-green mb-2">Average ROI: 312%</div>
                <div className="text-gray-600">Typical payback period: 4-6 months</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Executive Testimonial Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-50/80 to-white/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-16 tracking-tight">
            Trusted by <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero animate-gradient-x">Industry Leaders</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="glass-card hover-lift group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-venzip-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-8 w-8 text-venzip-primary" />
                </div>
                <blockquote className="text-lg text-gray-700 mb-6 italic leading-relaxed">
                  "Venzip reduced our compliance costs by $2.1M annually and helped us achieve SOC 2 certification in just 4 months."
                </blockquote>
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">Sarah Chen</div>
                  <div className="text-gray-600">Chief Risk Officer, TechCorp</div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-success-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-success-green/20 to-success-green/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-success-green" />
                </div>
                <blockquote className="text-lg text-gray-700 mb-6 italic leading-relaxed">
                  "The AI-driven approach eliminated 80% of manual work. Our audit prep time went from 6 months to 6 weeks."
                </blockquote>
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">Michael Rodriguez</div>
                  <div className="text-gray-600">CISO, Global Financial Services</div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-venzip-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-venzip-accent/20 to-venzip-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-venzip-accent" />
                </div>
                <blockquote className="text-lg text-gray-700 mb-6 italic leading-relaxed">
                  "Board reporting became effortless. Real-time dashboards give executives the visibility they need."
                </blockquote>
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">Jennifer Park</div>
                  <div className="text-gray-600">VP Compliance, Healthcare Leaders</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-50/50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
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
      <section className="py-20 bg-gradient-to-r from-venzip-primary to-venzip-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            {isAuthenticated ? "Continue Your Compliance Journey" : "Ready to Transform Your Compliance Journey?"}
          </h2>
          <p className="text-xl mb-8 text-white/90">
            {isAuthenticated ? "Complete your setup and start achieving compliance excellence" : "Join hundreds of companies who trust Venzip for their compliance needs"}
          </p>
          <Button
            onClick={handleGetStarted}
            className="bg-white text-venzip-primary hover:bg-gray-100 font-semibold px-12 py-4 text-lg rounded-xl hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300"
          >
            {isAuthenticated ? "Complete Setup" : "Start Your Free Trial Today"}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
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
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white">Platform</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-venzip-primary transition-colors duration-300">Features</button></li>
                <li><button onClick={() => scrollToSection('frameworks')} className="hover:text-venzip-primary transition-colors duration-300">Frameworks</button></li>
                <li><button onClick={() => scrollToSection('enterprise')} className="hover:text-venzip-primary transition-colors duration-300">Enterprise</button></li>
                <li><button onClick={() => scrollToSection('roi-metrics')} className="hover:text-venzip-primary transition-colors duration-300">ROI</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white">Resources</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><a href="#" className="hover:text-venzip-accent transition-colors duration-300">Documentation</a></li>
                <li><a href="#" className="hover:text-venzip-accent transition-colors duration-300">Compliance Guides</a></li>
                <li><a href="#" className="hover:text-venzip-accent transition-colors duration-300">Best Practices</a></li>
                <li><a href="#" className="hover:text-venzip-accent transition-colors duration-300">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white">Company</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><a href="#" className="hover:text-success-green transition-colors duration-300">About Us</a></li>
                <li><a href="#" className="hover:text-success-green transition-colors duration-300">Security</a></li>
                <li><a href="#" className="hover:text-success-green transition-colors duration-300">Privacy Policy</a></li>
                <li><a href="mailto:support@venzip.com" className="hover:text-success-green transition-colors duration-300">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700/50 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © 2025 Venzip. All rights reserved. Built with ❤️ for compliance teams.
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