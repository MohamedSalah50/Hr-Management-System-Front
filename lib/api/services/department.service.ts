// lib/api/services/department.service.ts

import { apiClient } from "../client";
import {
  IResponse,
  IPaginatedResponse,
  IDepartment,
  ICreateDepartment,
  IUpdateDepartment,
} from "@/lib/types/api.types";

export const departmentService = {
  // Create department - Backend returns { message, data }
  create: async (data: ICreateDepartment) => {
    const response = await apiClient.post<IResponse<IDepartment[]>>(
      "/departments",
      data,
    );
    return response.data;
  },

  // Get all departments - Backend returns { data, total }
  getAll: async () => {
    const response = await apiClient.get<{
      data: IDepartment[];
      total: number;
    }>("/departments");

    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<IDepartment>>;
  },

  // Get department by ID - Backend returns { data }
  getById: async (id: string) => {
    const response = await apiClient.get<{ data: IDepartment }>(
      `/departments/${id}`,
    );
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<IDepartment>;
  },

  // Update department - Backend returns { message, data }
  update: async (id: string, data: IUpdateDepartment) => {
    const response = await apiClient.patch<IResponse<IDepartment>>(
      `/departments/${id}`,
      data,
    );
    return response.data;
  },

  // Delete department - Backend returns { message }
  delete: async (id: string) => {
    const response = await apiClient.patch<IResponse>(`/departments/${id}/soft-delete`);
    return response.data;
  },
};
