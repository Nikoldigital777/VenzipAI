// client/src/pages/dashboard.tsx
import { useSummary } from "@/hooks/useSummary";
import ProgressRing from "@/components/progress-ring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Gap = { id: string; title: string; severity: "low" | "medium" | "high" };
type Activity = { id: string; action: string; resourceType: string; createdAt: string };
type Summary = {
  compliancePercent: number;
  gaps: Gap[];
  stats: { uploads: number; conversations: number };
  recentActivity: Activity[];
};

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useSummary();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-6">
        <Card><CardContent className="py-10">Loading dashboard…</CardContent></Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-6">
        <Card>
          <CardHeader><CardTitle>Dashboard</CardTitle></CardHeader>
          <CardContent>
            <div className="text-red-600 text-sm">
              {(error as Error)?.message || "Failed to load summary."}
            </div>
            <button
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center px-4 py-2 rounded-md bg-venzip-primary text-white"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { compliancePercent, gaps, stats, recentActivity } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-6">
      {/* Compliance score */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Overall compliance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <ProgressRing percentage={compliancePercent} />
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Key stats</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border p-5">
            <div className="text-sm text-gray-500">Evidence uploads</div>
            <div className="text-3xl font-semibold">{stats.uploads}</div>
          </div>
          <div className="rounded-xl border p-5">
            <div className="text-sm text-gray-500">AI conversations</div>
            <div className="text-3xl font-semibold">{stats.conversations}</div>
          </div>
        </CardContent>
      </Card>

      {/* Gaps */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Top gaps</CardTitle></CardHeader>
        <CardContent>
          {gaps.length === 0 ? (
            <div className="text-sm text-gray-500">No gaps detected.</div>
          ) : (
            <ul className="space-y-3">
              {gaps.map((g: Gap) => (
                <li key={g.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="font-medium">{g.title}</div>
                  <span
                    className={[
                      "px-2 py-1 text-xs rounded-full capitalize",
                      g.severity === "high" ? "bg-danger-coral/20 text-danger-coral" :
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
      <Card className="lg:col-span-1">
        <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
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
  );
}