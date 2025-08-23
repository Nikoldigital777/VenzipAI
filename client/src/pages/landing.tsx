import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="glass-card max-w-2xl mx-auto animate-fade-in">
        <CardContent className="p-12 text-center">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-8 bg-gradient-primary rounded-full flex items-center justify-center animate-float shadow-xl">
            <i className="fas fa-shield-alt text-white text-2xl"></i>
          </div>
          
          {/* Header */}
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="bg-gradient-primary bg-clip-text text-transparent">Venzip</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            AI-powered compliance made simple. Streamline your SOC 2, ISO 27001, HIPAA, 
            and GDPR compliance with intelligent automation and expert guidance.
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="text-center">
              <div className="w-12 h-12 bg-venzip-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-robot text-venzip-primary text-lg"></i>
              </div>
              <h3 className="font-semibold text-gray-900">AI-Powered</h3>
              <p className="text-sm text-gray-600">Claude integration for intelligent compliance guidance</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-venzip-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-chart-bar text-venzip-accent text-lg"></i>
              </div>
              <h3 className="font-semibold text-gray-900">Real-time Tracking</h3>
              <p className="text-sm text-gray-600">Monitor your compliance progress with interactive dashboards</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-venzip-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-shield-check text-venzip-secondary text-lg"></i>
              </div>
              <h3 className="font-semibold text-gray-900">Multiple Frameworks</h3>
              <p className="text-sm text-gray-600">Support for SOC 2, ISO 27001, HIPAA, and GDPR</p>
            </div>
          </div>
          
          {/* CTA */}
          <Button 
            onClick={handleLogin}
            className="bg-gradient-primary hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold px-8 py-4 rounded-xl text-lg"
            data-testid="button-login"
          >
            <i className="fas fa-rocket mr-2"></i>
            Get Started with Compliance
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            Sign in with your Replit account to begin your compliance journey
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
