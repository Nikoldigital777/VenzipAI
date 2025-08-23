import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <i className="fas fa-shield-alt text-white text-lg"></i>
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Venzip</span>
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
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-venzip-primary/10 text-venzip-primary border-venzip-primary/20 px-4 py-2 text-sm font-medium">
              🚀 AI-Powered Compliance Platform
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Simplify Your
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">Compliance Journey</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Transform complex compliance requirements into manageable workflows. 
              Our AI-powered platform guides you through SOC 2, ISO 27001, HIPAA, and GDPR 
              compliance with intelligent automation and expert insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                onClick={handleLogin}
                size="lg"
                className="bg-gradient-primary hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold px-8 py-4 rounded-xl text-lg"
                data-testid="button-login-hero"
              >
                <i className="fas fa-rocket mr-2"></i>
                Start Your Compliance Journey
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => scrollToSection('features')}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-xl text-lg"
              >
                <i className="fas fa-play mr-2"></i>
                See How It Works
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <i className="fas fa-check-circle text-success-green"></i>
                <span>Enterprise-Grade Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-shield-check text-success-green"></i>
                <span>SOC 2 Compliant Platform</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-clock text-success-green"></i>
                <span>Setup in Minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Compliance Made <span className="bg-gradient-primary bg-clip-text text-transparent">Intelligent</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines AI-powered automation with expert guidance to streamline your compliance workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI-Powered Analysis */}
            <Card className="glass-card hover-lift group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-brain text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">AI Document Analysis</h3>
                <p className="text-gray-600 mb-4">
                  Upload your policies and procedures. Our AI instantly identifies compliance gaps, 
                  provides recommendations, and generates improvement suggestions.
                </p>
                <div className="text-sm text-venzip-primary font-medium">
                  <i className="fas fa-arrow-right mr-2"></i>Powered by Claude AI
                </div>
              </CardContent>
            </Card>

            {/* Real-time Dashboard */}
            <Card className="glass-card hover-lift group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-warning rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-chart-line text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Real-time Progress Tracking</h3>
                <p className="text-gray-600 mb-4">
                  Monitor your compliance journey with interactive dashboards, automated progress tracking, 
                  and visual risk heatmaps that update in real-time.
                </p>
                <div className="text-sm text-warning-orange font-medium">
                  <i className="fas fa-arrow-right mr-2"></i>Live compliance metrics
                </div>
              </CardContent>
            </Card>

            {/* Risk Management */}
            <Card className="glass-card hover-lift group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-danger rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-shield-alt text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Intelligent Risk Assessment</h3>
                <p className="text-gray-600 mb-4">
                  Automatically identify, assess, and prioritize risks across your organization. 
                  Get AI-generated mitigation strategies and track remediation progress.
                </p>
                <div className="text-sm text-danger-coral font-medium">
                  <i className="fas fa-arrow-right mr-2"></i>Automated risk scoring
                </div>
              </CardContent>
            </Card>

            {/* Task Management */}
            <Card className="glass-card hover-lift group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-success rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-tasks text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Task Management</h3>
                <p className="text-gray-600 mb-4">
                  Organize compliance tasks with automated prioritization, deadline tracking, 
                  and team collaboration features. Never miss critical compliance activities.
                </p>
                <div className="text-sm text-success-green font-medium">
                  <i className="fas fa-arrow-right mr-2"></i>Automated workflows
                </div>
              </CardContent>
            </Card>

            {/* Document Library */}
            <Card className="glass-card hover-lift group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-venzip-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-folder-open text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Evidence Library</h3>
                <p className="text-gray-600 mb-4">
                  Centralize all compliance documentation with automated categorization, 
                  version control, and audit-ready organization across all frameworks.
                </p>
                <div className="text-sm text-venzip-accent font-medium">
                  <i className="fas fa-arrow-right mr-2"></i>Audit-ready organization
                </div>
              </CardContent>
            </Card>

            {/* AI Chat Assistant */}
            <Card className="glass-card hover-lift group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-venzip-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-comments text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">24/7 AI Compliance Assistant</h3>
                <p className="text-gray-600 mb-4">
                  Get instant answers to compliance questions, implementation guidance, 
                  and expert recommendations through our integrated AI chat assistant.
                </p>
                <div className="text-sm text-venzip-secondary font-medium">
                  <i className="fas fa-arrow-right mr-2"></i>Expert guidance on-demand
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
              Support for Major <span className="bg-gradient-primary bg-clip-text text-transparent">Compliance Frameworks</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're pursuing SOC 2, ISO 27001, HIPAA, or GDPR compliance, we've got you covered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card hover-lift text-center group">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-venzip-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-certificate text-venzip-primary text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">SOC 2</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Service Organization Control 2 for security, availability, and confidentiality
                </p>
                <Badge className="bg-venzip-primary/10 text-venzip-primary">Enterprise Ready</Badge>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift text-center group">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-venzip-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-globe text-venzip-accent text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">ISO 27001</h3>
                <p className="text-gray-600 text-sm mb-4">
                  International standard for information security management systems
                </p>
                <Badge className="bg-venzip-accent/10 text-venzip-accent">Global Standard</Badge>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift text-center group">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-danger-coral/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-user-shield text-danger-coral text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">HIPAA</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Health Insurance Portability and Accountability Act for healthcare data
                </p>
                <Badge className="bg-danger-coral/10 text-danger-coral">Healthcare</Badge>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift text-center group">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-venzip-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-balance-scale text-venzip-secondary text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">GDPR</h3>
                <p className="text-gray-600 text-sm mb-4">
                  General Data Protection Regulation for EU data privacy compliance
                </p>
                <Badge className="bg-venzip-secondary/10 text-venzip-secondary">EU Privacy</Badge>
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
              Get Compliant in <span className="bg-gradient-primary bg-clip-text text-transparent">3 Simple Steps</span>
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
                Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent">Venzip</span>?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Transform your compliance process from a burden into a strategic advantage
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-success-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-clock text-success-green text-sm"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Save 80% of Time</h4>
                    <p className="text-gray-600">Automate tedious compliance tasks and focus on what matters most to your business</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-venzip-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-dollar-sign text-venzip-primary text-sm"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Reduce Costs by 60%</h4>
                    <p className="text-gray-600">Eliminate expensive consultants and manual processes with intelligent automation</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-warning-orange/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-chart-line text-warning-orange text-sm"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Increase Success Rate</h4>
                    <p className="text-gray-600">AI-guided approach ensures you meet all requirements and pass audits on the first try</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-venzip-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-shield-check text-venzip-accent text-sm"></i>
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
                      <i className="fas fa-chart-pie text-white text-2xl"></i>
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
      <section className="py-20 px-6 bg-gradient-to-r from-venzip-primary via-venzip-accent to-venzip-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Compliance?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of companies who have streamlined their compliance process with Venzip. 
            Start your journey today and achieve compliance faster than ever before.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-white text-venzip-primary hover:bg-gray-50 hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold px-8 py-4 rounded-xl text-lg"
              data-testid="button-login-cta"
            >
              <i className="fas fa-rocket mr-2"></i>
              Start Free Today
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.open('mailto:support@venzip.com', '_blank')}
              className="border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg"
            >
              <i className="fas fa-envelope mr-2"></i>
              Contact Sales
            </Button>
          </div>

          <p className="text-white/75 text-sm">
            Sign in with your Replit account • No credit card required • Setup in under 5 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <i className="fas fa-shield-alt text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold">Venzip</span>
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