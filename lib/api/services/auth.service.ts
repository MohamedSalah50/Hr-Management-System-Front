// lib/api/services/auth.service.ts

import {
  ILoginCredentials,
  ILoginResponse,
  IResponse,
  ISignupData,
  IUser,
  RoleEnum,
} from "@/lib/types/api.types";
import { apiClient } from "../client";

export const authService = {
  // Login
  login: async (credentials: ILoginCredentials) => {
    const response = await apiClient.post<IResponse<ILoginResponse>>(
      "/auth/login",
      credentials,
    );
    return response.data;
  },

  // Signup
  signup: async (data: ISignupData) => {
    const response = await apiClient.post<IResponse>("/auth/signup", data);
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await apiClient.post<IResponse<ILoginResponse>>(
      "/auth/refresh-token",
    );
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post<IResponse>("/auth/logout");
    return response.data;
  },

  // Get current user - Backend returns user object with role populated
  getCurrentUser: async () => {
    const response = await apiClient.get<{
      id: string;
      fullName: string;
      username: string;
      email: string;
      role: RoleEnum;
      isActive: boolean;
    }>("/auth/me");

    // Transform backend response to match IUser interface
    const userData: IUser = {
      id: response.data.id,
      _id: response.data.id,
      userName: response.data.username,
      email: response.data.email,
      fullName: response.data?.fullName,
      roleId: response.data.role, // RoleEnum is already populated
      isActive: response.data.isActive,
      // Add any other required IUser properties here
    };

    return {
      data: userData,
      message: "success",
      status: 200,
    } as IResponse<IUser>;
  },
};
