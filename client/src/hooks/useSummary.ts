// client/src/hooks/useSummary.ts
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useSummary() {
  return useQuery({
    queryKey: ["/api/summary"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/summary");
        if (!res.ok) {
          console.warn("Summary API failed:", res.status, res.statusText);
          throw new Error(`Failed to fetch summary: ${res.status}`);
        }
        const data = await res.json();
        
        // Ensure data structure consistency
        return {
          compliancePercent: data.compliancePercent || 0,
          gaps: Array.isArray(data.gaps) ? data.gaps : [],
          stats: {
            uploads: data.stats?.uploads || 0,
            conversations: data.stats?.conversations || 0,
            tasksOpenHigh: data.stats?.tasksOpenHigh || 0,
            risksHigh: data.stats?.risksHigh || 0,
          },
          recentActivity: Array.isArray(data.recentActivity) ? data.recentActivity : [],
        };
      } catch (error) {
        console.error("Error fetching summary:", error);
        // Return safe fallback data
        return {
          compliancePercent: 0,
          gaps: [],
          stats: {
            uploads: 0,
            conversations: 0,
            tasksOpenHigh: 0,
            risksHigh: 0,
          },
          recentActivity: [],
        };
      }
    },
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
  });
}