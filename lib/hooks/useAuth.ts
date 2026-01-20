// lib/hooks/useAuth.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { authService } from "../api/services/auth.service";
import { ILoginCredentials, ISignupData } from "../types/api.types";

export const AUTH_KEYS = {
  currentUser: ["auth", "current-user"] as const,
};

// Get current user
export const useCurrentUser = () => {
  const hasToken =
    typeof window !== "undefined" && !!localStorage.getItem("access_token");

  return useQuery({
    queryKey: AUTH_KEYS.currentUser,
    queryFn: async () => {
      const result = await authService.getCurrentUser();
      return result;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: hasToken,
  });
};

// Login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: ILoginCredentials) => {
      const result = await authService.login(credentials);
      return result;
    },
    onSuccess: (data) => {
      if (data.data?.credentials) {
        const { access_token, refresh_token } = data.data.credentials;

        apiClient.setToken(access_token);
        apiClient.setRefreshToken(refresh_token);

        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.currentUser });
      }
    },
    onError: (error) => {
      console.error("❌ Login error:", error);
    },
  });
};

// Signup
export const useSignup = () => {
  return useMutation({
    mutationFn: (data: ISignupData) => authService.signup(data),
  });
};

// Logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      apiClient.clearTokens();
      queryClient.clear();
    },
  });
};
