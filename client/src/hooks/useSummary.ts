// client/src/hooks/useSummary.ts
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useSummary() {
  return useQuery({
    queryKey: ["/api/summary"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/summary");
      if (!res.ok) throw new Error("Failed to load summary");
      return res.json();
    },
    refetchOnWindowFocus: false,
  });
}