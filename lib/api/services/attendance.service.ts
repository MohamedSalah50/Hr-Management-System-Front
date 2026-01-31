
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
  create: async (data: ICreateAttendance) => {
    const response = await apiClient.post<{
      message: string;
      data: IAttendance[];
    }>("/attendance", data);

    return {
      data: response.data.data[0],
      message: response.data.message,
      status: 200,
    } as IResponse<IAttendance>;
  },

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

  update: async (id: string, data: IUpdateAttendance) => {
    const response = await apiClient.patch<{
      message: string;
      data: IAttendance;
    }>(`/attendance/${id}`, data);

    return {
      data: response.data.data,
      message: response.data.message,
      status: 200,
    } as IResponse<IAttendance>;
  },

  delete: async (id: string) => {
    const response = await apiClient.patch<{ message: string }>(
      `/attendance/${id}/soft-delete`,
    );
    return {
      message: response.data.message,
      status: 200,
    } as IResponse;
  },

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

  exportExcel: async (searchData: ISearchAttendance) => {
    return await apiClient.downloadFile(
      "/attendance/export",
      `attendance-${Date.now()}.xlsx`,
      searchData,
    );
  },
};
