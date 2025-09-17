// client/src/hooks/useSummary.ts
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useSummary() {
  return useQuery({
    queryKey: ["/api/summary"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/summary");
      if (!res.ok) {
        // Return default data structure if API fails
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
      return res.json();
    },
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}