import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnMount: true, // Always check on mount for onboarding status
    staleTime: 1 * 60 * 1000, // Reduce to 1 minute for better onboarding tracking
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    enabled: true,
  });

  const logout = async () => {
    try {
      // Clear auth cache first
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.clear();

      // Redirect to logout endpoint (this will handle server-side logout and redirect)
      window.location.href = "/api/logout";
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if there's an error
      window.location.href = "/api/logout";
    }
  };

  // Check if user has completed onboarding
  const hasCompletedOnboarding = user ? user.onboardingCompleted : false;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasCompletedOnboarding,
    error,
    logout,
  };
}