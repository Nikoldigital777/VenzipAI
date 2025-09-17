import EvidenceMappingDashboard from "@/components/evidence-mapping-dashboard";
import LazyAIChat from "@/components/LazyAIChat";
import { Shield, Brain, MapPin, Target, CheckCircle } from "lucide-react";

export default function Evidence() {
  return (
    <>
      <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50/80 via-white/50 to-venzip-primary/5 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-venzip-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-venzip-accent/10 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-venzip-secondary/8 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          {/* Enhanced Page Header */}
          <div className="mb-12 text-center animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Evidence <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero animate-gradient-x">Mapping</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
              AI-powered document mapping to compliance requirements with intelligent analysis
            </p>

            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
              <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl border-0 shadow-lg animate-fadeInUp" style={{animationDelay: '0.1s'}}>
                <div className="w-8 h-8 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-venzip-primary" />
                </div>
                <span className="text-sm font-medium text-gray-700">Automated Compliance Analysis</span>
              </div>
              <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl border-0 shadow-lg animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                <div className="w-8 h-8 bg-gradient-to-br from-venzip-secondary/20 to-venzip-secondary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-venzip-secondary" />
                </div>
                <span className="text-sm font-medium text-gray-700">Cross-Framework Mapping</span>
              </div>
              <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl border-0 shadow-lg animate-fadeInUp" style={{animationDelay: '0.3s'}}>
                <div className="w-8 h-8 bg-gradient-to-br from-venzip-accent/20 to-venzip-accent/10 rounded-lg flex items-center justify-center">
                  <Brain className="h-4 w-4 text-venzip-accent" />
                </div>
                <span className="text-sm font-medium text-gray-700">AI Quality Scoring</span>
              </div>
              <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl border-0 shadow-lg animate-fadeInUp" style={{animationDelay: '0.4s'}}>
                <div className="w-8 h-8 bg-gradient-to-br from-success-green/20 to-success-green/10 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-success-green" />
                </div>
                <span className="text-sm font-medium text-gray-700">Smart Gap Detection</span>
              </div>
            </div>
          </div>

          {/* Enhanced Dashboard Content */}
          <div className="animate-fadeInUp" style={{animationDelay: '0.5s'}}>
            <EvidenceMappingDashboard />
          </div>
        </div>
      </div>
      <LazyAIChat />
    </>
  );
}