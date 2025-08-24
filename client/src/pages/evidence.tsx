import Navigation from "@/components/navigation";
import EvidenceMappingDashboard from "@/components/evidence-mapping-dashboard";
import AIChat from "@/components/ai-chat";
import { Shield, Brain, MapPin } from "lucide-react";

export default function Evidence() {
  return (
    <>
      <Navigation />
      <div className="pt-16 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <div className="max-w-7xl mx-auto p-6 pb-20">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Evidence Mapping</h1>
                <p className="text-gray-600">AI-powered document mapping to compliance requirements</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-venzip-primary" />
                <span>Automated compliance analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-venzip-primary" />
                <span>Cross-framework mapping</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-venzip-primary" />
                <span>AI quality scoring</span>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <EvidenceMappingDashboard />
        </div>
      </div>
      <AIChat />
    </>
  );
}