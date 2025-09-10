import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnMount: false, // Only fetch once
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    enabled: true, // Always run the query
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
