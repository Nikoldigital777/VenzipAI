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
          
          // Handle specific error codes
          if (res.status === 401) {
            throw new Error("Authentication required");
          } else if (res.status === 403) {
            throw new Error("Access denied");
          } else if (res.status >= 500) {
            throw new Error("Server error - please try again");
          } else {
            throw new Error(`Failed to fetch summary: ${res.status}`);
          }
        }
        
        const data = await res.json();
        
        // Validate and sanitize data structure
        const sanitizedData = {
          compliancePercent: Math.max(0, Math.min(100, data.compliancePercent || 0)),
          gaps: Array.isArray(data.gaps) ? data.gaps.filter((gap: any) => gap && gap.id && gap.title) : [],
          stats: {
            uploads: Math.max(0, data.stats?.uploads || 0),
            conversations: Math.max(0, data.stats?.conversations || 0),
            tasksOpenHigh: Math.max(0, data.stats?.tasksOpenHigh || 0),
            risksHigh: Math.max(0, data.stats?.risksHigh || 0),
            totalEvidence: Math.max(0, data.stats?.totalEvidence || 0),
            policies: Math.max(0, data.stats?.policies || 0),
          },
          recentActivity: Array.isArray(data.recentActivity) ? 
            data.recentActivity.filter((activity: any) => activity && activity.id && activity.action) : [],
          hasData: data.compliancePercent > 0 || (data.gaps && data.gaps.length > 0) || 
                   (data.stats && Object.values(data.stats).some((val: any) => val > 0)),
          error: data.error,
          lastUpdated: new Date().toISOString()
        };
        
        console.log("Summary data loaded:", sanitizedData);
        return sanitizedData;
      } catch (error) {
        console.error("Error fetching summary:", error);
        
        // Return detailed error information for debugging
        const fallbackData = {
          compliancePercent: 0,
          gaps: [],
          stats: {
            uploads: 0,
            conversations: 0,
            tasksOpenHigh: 0,
            risksHigh: 0,
            totalEvidence: 0,
            policies: 0,
          },
          recentActivity: [],
          hasData: false,
          error: error instanceof Error ? error.message : "Unknown error",
          lastUpdated: new Date().toISOString()
        };
        
        // Don't throw in fallback mode - return error data instead
        if (error instanceof Error && error.message.includes("Authentication")) {
          throw error; // Re-throw auth errors
        }
        
        return fallbackData;
      }
    },
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error instanceof Error && error.message.includes("Authentication")) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 30000,
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}