// lib/api/services/user.service.ts

import { apiClient } from "../client";
import {
  IResponse,
  IPaginatedResponse,
  IUser,
  ICreateUser,
  IUpdateUser,
  IChangePassword,
} from "@/lib/types/api.types";

export const userService = {
  // Create user - Backend returns { message, data }
  create: async (data: ICreateUser) => {
    const response = await apiClient.post<IResponse<IUser[]>>("/user", data);
    return response.data;
  },

  // Get all users - Backend returns { data, total }
  getAll: async () => {
    const response = await apiClient.get<{
      data: IUser[];
      total: number;
    }>("/user");

    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<IUser>>;
  },

  // Search users - Backend returns { data, total }
  search: async (query: string) => {
    const response = await apiClient.get<{
      data: IUser[];
      total: number;
    }>(`/user?search=${encodeURIComponent(query)}`);

    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<IUser>>;
  },

  // Get users by role - Backend returns { data, total }
  getByRole: async (roleId: string) => {
    const response = await apiClient.get<{
      data: IUser[];
      total: number;
    }>(`/user?roleId=${roleId}`);

    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<IUser>>;
  },

  // Get user by ID - Backend returns { data }
  getById: async (id: string) => {
    const response = await apiClient.get<{ data: IUser }>(`/user/${id}`);
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<IUser>;
  },

  // Update user - Backend returns { message, data }
  update: async (id: string, data: IUpdateUser) => {
    const response = await apiClient.patch<IResponse<IUser>>(
      `/user/${id}`,
      data,
    );
    return response.data;
  },

  // Delete user - Backend returns { message }
  delete: async (id: string) => {
    const response = await apiClient.delete<IResponse>(`/user/${id}`);
    return response.data;
  },

  // Toggle user status - Backend returns { message, data: { id, isActive } }
  toggleStatus: async (id: string) => {
    const response = await apiClient.patch<
      IResponse<{ id: string; isActive: boolean }>
    >(`/user/${id}/toggle-status`);
    return response.data;
  },

  // Change password - Backend returns { message }
  changePassword: async (data: IChangePassword) => {
    const response = await apiClient.post<IResponse>(
      "/user/change-password",
      data,
    );
    return response.data;
  },
};
