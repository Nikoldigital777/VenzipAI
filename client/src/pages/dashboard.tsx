// client/src/pages/dashboard.tsx
import { useSummary } from "@/hooks/useSummary";
import ProgressRing from "@/components/progress-ring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import AIChat from "@/components/ai-chat";
import { 
  Upload, 
  MessageSquare, 
  AlertTriangle, 
  Target, 
  TrendingUp,
  Clock,
  Activity,
  RefreshCw
} from "lucide-react";

type Gap = { 
  id: string; 
  title: string; 
  severity: "low" | "medium" | "high" | "critical"; 
  kind: "task" | "risk";
  meta: {
    framework?: string;
    status?: string;
    dueDate?: string;
    category?: string;
    likelihood?: string;
  };
};
type Activity = { id: string; action: string; resourceType: string; createdAt: string };
type Summary = {
  compliancePercent: number;
  gaps: Gap[];
  stats: { 
    uploads: number; 
    conversations: number; 
    tasksOpenHigh?: number; 
    risksHigh?: number; 
  };
  recentActivity: Activity[];
};

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useSummary();

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
          <div className="max-w-7xl mx-auto px-4 py-12 grid gap-6">
            <Card><CardContent className="py-10">Loading dashboard…</CardContent></Card>
          </div>
        </div>
        <AIChat />
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        <Navigation />
        <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
          <div className="max-w-7xl mx-auto px-4 py-12 grid gap-6">
            <Card>
              <CardHeader><CardTitle>Dashboard</CardTitle></CardHeader>
              <CardContent>
                <div className="text-red-600 text-sm">
                  {(error as Error)?.message || "Failed to load summary."}
                </div>
                <button
                  onClick={() => refetch()}
                  className="mt-4 inline-flex items-center px-4 py-2 rounded-md bg-venzip-primary text-white hover:bg-venzip-primary/90 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
        <AIChat />
      </>
    );
  }

  const { compliancePercent, gaps, stats, recentActivity } = data;

  return (
    <>
      <Navigation />
      <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-6">
      {/* Compliance score */}
      <Card className="lg:col-span-1 glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-venzip-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-venzip-primary" />
            </div>
            Overall compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <ProgressRing percentage={compliancePercent} />
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Key stats</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-4 gap-4">
          <div className="rounded-xl border p-5 glass-card hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-500">Evidence uploads</div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Upload className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900">{stats.uploads}</div>
          </div>
          <div className="rounded-xl border p-5 glass-card hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-500">AI conversations</div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900">{stats.conversations}</div>
          </div>
          <div className="rounded-xl border p-5 glass-card hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-500">High priority tasks</div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900">{stats.tasksOpenHigh || 0}</div>
          </div>
          <div className="rounded-xl border p-5 glass-card hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-500">High impact risks</div>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900">{stats.risksHigh || 0}</div>
          </div>
        </CardContent>
      </Card>

      {/* Gaps */}
      <Card className="lg:col-span-2 glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
            Top gaps
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gaps.length === 0 ? (
            <div className="text-sm text-gray-500">No gaps detected.</div>
          ) : (
            <ul className="space-y-3">
              {gaps.map((g: Gap) => (
                <li key={g.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="font-medium">
                      {g.title}
                      <span className="ml-2 text-xs text-gray-500">
                        {g.kind === "task" 
                          ? `(${g.meta?.framework?.toUpperCase() || "task"})` 
                          : `(${g.meta?.category || "risk"})`
                        }
                      </span>
                    </div>
                    {g.meta?.dueDate && (
                      <div className="text-xs text-gray-400 mt-1">
                        Due: {new Date(g.meta.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <span
                    className={[
                      "px-2 py-1 text-xs rounded-full capitalize",
                      g.severity === "critical" ? "bg-red-500/15 text-red-600" :
                      g.severity === "high" ? "bg-amber-500/15 text-amber-600" :
                      g.severity === "medium" ? "bg-venzip-primary/20 text-venzip-primary-dark" :
                      "bg-success-green/20 text-success-green"
                    ].join(" ")}
                  >
                    {g.severity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card className="lg:col-span-1 glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="h-4 w-4 text-purple-600" />
            </div>
            Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recentActivity.length === 0 ? (
              <li className="text-sm text-gray-500">No activity yet.</li>
            ) : recentActivity.map((a: Activity) => (
              <li key={a.id} className="flex items-center justify-between border rounded-lg p-3">
                <div className="text-sm">
                  <div className="font-medium">{a.action}</div>
                  <div className="text-gray-500">{a.resourceType}</div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(a.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
        </div>
      </div>
      <AIChat />
    </>
  );
}