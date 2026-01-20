// lib/api/services/attendance.service.ts

import { apiClient } from "../client";
import {
  IResponse,
  IPaginatedResponse,
  IAttendance,
  ICreateAttendance,
  IUpdateAttendance,
  ISearchAttendance,
  IAttendanceStatistics,
} from "@/lib/types/api.types";

export const attendanceService = {
  // Create attendance record
  create: async (data: ICreateAttendance) => {
    const response = await apiClient.post<IResponse<IAttendance[]>>(
      "/attendance",
      data,
    );
    return response.data;
  },

  // Get all attendance records - Backend returns { data, total }
  getAll: async () => {
    const response = await apiClient.get<{
      data: IAttendance[];
      total: number;
    }>("/attendance");

    // Transform to match expected structure
    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<IAttendance>>;
  },

  // Search attendance records - Backend returns { data, total }
  search: async (searchData: ISearchAttendance) => {
    const response = await apiClient.post<{
      data: IAttendance[];
      total: number;
    }>("/attendance/search", searchData);

    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<IAttendance>>;
  },

  // Get attendance by ID - Backend returns { data }
  getById: async (id: string) => {
    const response = await apiClient.get<{ data: IAttendance }>(
      `/attendance/${id}`,
    );
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<IAttendance>;
  },

  // Update attendance record - Backend returns { message, data }
  update: async (id: string, data: IUpdateAttendance) => {
    const response = await apiClient.patch<IResponse<IAttendance>>(
      `/attendance/${id}`,
      data,
    );
    return response.data;
  },

  // Delete attendance record - Backend returns { message }
  delete: async (id: string) => {
    const response = await apiClient.delete<IResponse>(`/attendance/${id}`);
    return response.data;
  },

  // Get statistics for employee - Backend returns { data }
  getStatistics: async (employeeId: string, month: number, year: number) => {
    const response = await apiClient.get<{ data: IAttendanceStatistics }>(
      `/attendance/statistics/${employeeId}?month=${month}&year=${year}`,
    );
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<IAttendanceStatistics>;
  },

  // Import from Excel
  importExcel: async (file: File) => {
    const response = await apiClient.uploadFile<
      IResponse<{
        imported: number;
        errors: number;
        errorDetails: Array<{ row: number; error: string }>;
      }>
    >("/attendance/import", file, "file");
    return response.data;
  },

  // Export to Excel
  exportExcel: async (searchData: ISearchAttendance) => {
    await apiClient.downloadFile(
      "/attendance/export",
      `attendance-${Date.now()}.xlsx`,
      searchData,
    );
  },
};
