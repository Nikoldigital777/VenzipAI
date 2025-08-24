import Navigation from "@/components/navigation";
import EvidenceMappingDashboard from "@/components/evidence-mapping-dashboard";
import AIChat from "@/components/ai-chat";

export default function Evidence() {
  return (
    <>
      <Navigation />
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <div className="max-w-7xl mx-auto p-6">
          <EvidenceMappingDashboard />
        </div>
      </div>
      <AIChat />
    </>
  );
}