// lib/api/services/role-permission.service.ts

import { apiClient } from "../client";
import {
  IResponse,
  IPaginatedResponse,
  IRole,
  ICreateRole,
  IUpdateRole,
  IPermission,
  ICreatePermission,
  IUpdatePermission,
} from "@/lib/types/api.types";

// Role Service
export const roleService = {
  // Create role - Backend returns { message, data }
  create: async (data: ICreateRole) => {
    const response = await apiClient.post<IResponse<IRole[]>>("/role", data);
    return response.data;
  },

  // Get all roles - Backend returns { data, total }
  getAll: async () => {
    const response = await apiClient.get<{
      data: IRole[];
      total: number;
    }>("/role");

    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<IRole>>;
  },

  // Get role by ID - Backend returns { data }
  getById: async (id: string) => {
    const response = await apiClient.get<{ data: IRole }>(`/role/${id}`);
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<IRole>;
  },

  // Update role - Backend returns { message, data }
  update: async (id: string, data: IUpdateRole) => {
    const response = await apiClient.patch<IResponse<IRole>>(
      `/role/${id}`,
      data,
    );
    return response.data;
  },

  // Delete role - Backend returns { message }
  delete: async (id: string) => {
    const response = await apiClient.delete<IResponse>(`/role/${id}`);
    return response.data;
  },
};

// Permission Service
export const permissionService = {
  // Create permission - Backend returns { message, data }
  create: async (data: ICreatePermission) => {
    const response = await apiClient.post<IResponse<IPermission[]>>(
      "/permissions",
      data,
    );
    return response.data;
  },

  // Get all permissions - Backend returns { data, total }
  getAll: async () => {
    const response = await apiClient.get<{
      data: IPermission[];
      total: number;
    }>("/permissions");

    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<IPermission>>;
  },

  // Get permissions by resource - Backend returns { data, total }
  getByResource: async (resource: string) => {
    const response = await apiClient.get<{
      data: IPermission[];
      total: number;
    }>(`/permissions?resource=${resource}`);

    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<IPermission>>;
  },

  // Get permission by ID - Backend returns { data }
  getById: async (id: string) => {
    const response = await apiClient.get<{ data: IPermission }>(
      `/permissions/${id}`,
    );
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<IPermission>;
  },

  // Update permission - Backend returns { message, data }
  update: async (id: string, data: IUpdatePermission) => {
    const response = await apiClient.patch<IResponse<IPermission>>(
      `/permissions/${id}`,
      data,
    );
    return response.data;
  },

  // Delete permission - Backend returns { message }
  delete: async (id: string) => {
    const response = await apiClient.delete<IResponse>(`/permissions/${id}`);
    return response.data;
  },
};
