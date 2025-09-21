import EvidenceMappingDashboard from "@/components/evidence-mapping-dashboard";
import EvidenceFreshnessDashboard from "@/components/evidence-freshness-dashboard";
import LazyAIChat from "@/components/LazyAIChat";
import { Shield, Brain, MapPin, Target, CheckCircle, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Evidence() {
  return (
    <>
      <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50/80 via-white/50 to-venzip-primary/5 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-venzip-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-venzip-accent/10 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-venzip-secondary/8 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>

        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          {/* Header Section */}
          <div className="mb-12 animate-fadeInUp">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                  Evidence Management
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Intelligent evidence mapping and compliance tracking
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Evidence Status</div>
                  <div className="text-sm font-medium text-gray-900">Real-time Monitoring</div>
                </div>
                <div className="h-2 w-2 bg-success-green rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-5 gap-6 mb-12">
            <div className="bg-white/50 rounded-2xl p-6 border border-white/20 backdrop-blur-sm hover:bg-white/60 transition-all duration-300 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
              <div className="w-12 h-12 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-venzip-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-sm text-gray-600">Automatic evidence classification and mapping</p>
            </div>

            <div className="bg-white/50 rounded-2xl p-6 border border-white/20 backdrop-blur-sm hover:bg-white/60 transition-all duration-300 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <div className="w-12 h-12 bg-gradient-to-br from-venzip-accent/20 to-venzip-accent/10 rounded-2xl flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-venzip-accent" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Mapping</h3>
              <p className="text-sm text-gray-600">Precision control-to-evidence relationships</p>
            </div>

            <div className="bg-white/50 rounded-2xl p-6 border border-white/20 backdrop-blur-sm hover:bg-white/60 transition-all duration-300 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
              <div className="w-12 h-12 bg-gradient-to-br from-venzip-secondary/20 to-venzip-secondary/10 rounded-2xl flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-venzip-secondary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Gap Detection</h3>
              <p className="text-sm text-gray-600">Identify missing evidence requirements</p>
            </div>

            <div className="bg-white/50 rounded-2xl p-6 border border-white/20 backdrop-blur-sm hover:bg-white/60 transition-all duration-300 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
              <div className="w-12 h-12 bg-gradient-to-br from-success-green/20 to-success-green/10 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-success-green" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Assurance</h3>
              <p className="text-sm text-gray-600">Continuous evidence validation and scoring</p>
            </div>

            <div className="bg-white/50 rounded-2xl p-6 border border-white/20 backdrop-blur-sm hover:bg-white/60 transition-all duration-300 animate-fadeInUp" style={{animationDelay: '0.5s'}}>
              <div className="w-12 h-12 bg-gradient-to-br from-info-blue/20 to-info-blue/10 rounded-2xl flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-info-blue" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Freshness Tracking</h3>
              <p className="text-sm text-gray-600">Monitor evidence lifecycle and expiration</p>
            </div>
          </div>

          {/* Enhanced Dashboard Content with Tabs */}
          <div className="animate-fadeInUp" style={{animationDelay: '0.6s'}}>
            <Tabs defaultValue="mapping" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mapping" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Evidence Mapping
                </TabsTrigger>
                <TabsTrigger value="freshness" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Freshness Tracking
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mapping" className="space-y-6">
                <EvidenceMappingDashboard />
              </TabsContent>

              <TabsContent value="freshness" className="space-y-6">
                <EvidenceFreshnessDashboard />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <LazyAIChat />
    </>
  );
}