// lib/api/services/employee.service.ts

import { apiClient } from "../client";
import {
  IResponse,
  IPaginatedResponse,
  IEmployee,
  ICreateEmployee,
  IUpdateEmployee,
} from "@/lib/types/api.types";

export const employeeService = {
  // Create employee - Backend returns { message, data }
  create: async (data: ICreateEmployee) => {
    const response = await apiClient.post<IResponse<IEmployee[]>>(
      "/employee",
      data,
    );
    return response.data;
  },

  // Get all employees - Backend returns { data, total }
  getAll: async () => {
    const response = await apiClient.get<{
      data: IEmployee[];
      total: number;
    }>("/employee");

    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<IEmployee>>;
  },

  // Search employees - Backend returns { data, total }
  search: async (query: string) => {
    const response = await apiClient.get<{
      data: IEmployee[];
      total: number;
    }>(`/employee?search=${encodeURIComponent(query)}`);

    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<IEmployee>>;
  },

  // Get employees by department - Backend returns { data, total }
  getByDepartment: async (departmentId: string) => {
    const response = await apiClient.get<{
      data: IEmployee[];
      total: number;
    }>(`/employee?departmentId=${departmentId}`);

    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<IEmployee>>;
  },

  // Get employee by ID - Backend returns { data }
  getById: async (id: string) => {
    const response = await apiClient.get<{ data: IEmployee }>(
      `/employee/${id}`,
    );
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<IEmployee>;
  },

  // Update employee - Backend returns { message, data }
  update: async (id: string, data: IUpdateEmployee) => {
    const response = await apiClient.patch<IResponse<IEmployee>>(
      `/employee/${id}`,
      data,
    );
    return response.data;
  },

  // Delete employee - Backend returns { message }
  delete: async (id: string) => {
    const response = await apiClient.patch<IResponse>(`/employee/${id}/soft-delete`);
    return response.data;
  },

  // Toggle employee status - Backend returns { message, data: { id, isActive } }
  toggleStatus: async (id: string) => {
    const response = await apiClient.patch<
      IResponse<{ id: string; isActive: boolean }>
    >(`/employee/${id}/toggle-status`);
    return response.data;
  },
};
