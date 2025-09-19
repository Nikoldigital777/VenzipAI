import { GapDetection } from '@/components/compliance/GapDetection';
import { ProgressTracking } from '@/components/compliance/ProgressTracking';
import { ReportGenerator } from '@/components/reports/ReportGenerator';

export default function ComplianceInsights() {
  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="glass-card p-8 animate-fadeInUp" data-testid="framework-analytics">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Compliance <span className="text-gradient-primary bg-clip-text text-transparent bg-gradient-hero animate-gradient-x">Insights</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Track progress, identify gaps, and monitor compliance velocity across all frameworks
            </p>
          </div>
        </div>
      </div>

      {/* Progress Tracking */}
      <div className="animate-fadeInUp" style={{animationDelay: '0.1s'}}>
        <ProgressTracking />
      </div>

      {/* Gap Detection */}
      <div className="animate-fadeInUp" style={{animationDelay: '0.2s'}}>
        <GapDetection />
      </div>

      {/* Report Generation */}
      <div className="animate-fadeInUp" style={{animationDelay: '0.3s'}}>
        <ReportGenerator />
      </div>
    </div>
  );
}