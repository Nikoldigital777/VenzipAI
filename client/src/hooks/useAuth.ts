import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (not authenticated)
      if (error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 1;
    },
    refetchOnMount: 'always',
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    gcTime: 1 * 60 * 1000, // Keep in cache for 1 minute
    enabled: true,
    networkMode: 'online',
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

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout,
  };
}
