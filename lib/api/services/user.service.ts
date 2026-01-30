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
  create: async (data: ICreateUser) => {
    const response = await apiClient.post<IResponse<IUser[]>>("/user", data);
    return response.data;
  },

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

  getById: async (id: string) => {
    const response = await apiClient.get<{ data: IUser }>(`/user/${id}`);
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<IUser>;
  },

  update: async (id: string, data: IUpdateUser) => {
    const response = await apiClient.patch<IResponse<IUser>>(
      `/user/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.patch<IResponse>(`/user/${id}/soft-delete`);
    return response.data;
  },

  toggleStatus: async (id: string) => {
    const response = await apiClient.patch<
      IResponse<{ id: string; isActive: boolean }>
    >(`/user/${id}/toggle-status`);
    return response.data;
  },

  changePassword: async (data: IChangePassword) => {
    const response = await apiClient.post<IResponse>(
      "/user/change-password",
      data,
    );
    return response.data;
  },
};
