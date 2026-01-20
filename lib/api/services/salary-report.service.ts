// lib/api/services/salary-report.service.ts

import { apiClient } from "../client";
import {
  IResponse,
  IPaginatedResponse,
  ISalaryReport,
  IGenerateReport,
  ISearchReport,
  ISalarySummary,
  IReportForPrint,
} from "@/lib/types/api.types";

export const salaryReportService = {
  // Generate report for single employee - Backend returns { message, data }
  generate: async (data: IGenerateReport) => {
    const response = await apiClient.post<IResponse<ISalaryReport>>(
      "/salary-reports/generate",
      data,
    );
    return response.data;
  },

  // Generate reports for all employees
  generateAll: async (month: number, year: number) => {
    const response = await apiClient.post<
      IResponse<{
        success: Array<{
          employeeId: string;
          employeeName: string;
          report: ISalaryReport;
        }>;
        failed: Array<{
          employeeId: string;
          employeeName: string;
          error: string;
        }>;
      }>
    >("/salary-reports/generate-all", { month, year });
    return response.data;
  },

  // Regenerate report (delete old & create new) - Backend returns { message, data }
  regenerate: async (data: IGenerateReport) => {
    const response = await apiClient.post<IResponse<ISalaryReport>>(
      "/salary-reports/regenerate",
      data,
    );
    return response.data;
  },

  // Get all reports - Backend returns { data, total }
  getAll: async () => {
    const response = await apiClient.get<{
      data: ISalaryReport[];
      total: number;
    }>("/salary-reports");

    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<ISalaryReport>>;
  },

  // Search reports - Backend returns { data, total }
  search: async (searchData: ISearchReport) => {
    const response = await apiClient.post<{
      data: ISalaryReport[];
      total: number;
    }>("/salary-reports/search", searchData);

    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<ISalaryReport>>;
  },

  // Get report by ID - Backend returns { data }
  getById: async (id: string) => {
    const response = await apiClient.get<{ data: ISalaryReport }>(
      `/salary-reports/${id}`,
    );
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<ISalaryReport>;
  },

  // Delete report - Backend returns { message }
  delete: async (id: string) => {
    const response = await apiClient.delete<IResponse>(`/salary-reports/${id}`);
    return response.data;
  },

  // Get summary for period - Backend returns { data }
  getSummary: async (month: number, year: number) => {
    const response = await apiClient.get<{ data: ISalarySummary }>(
      `/salary-reports/summary?month=${month}&year=${year}`,
    );
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<ISalarySummary>;
  },

  // Get report formatted for printing - Backend returns { data }
  getForPrint: async (id: string) => {
    const response = await apiClient.get<{ data: IReportForPrint }>(
      `/salary-reports/${id}/print`,
    );
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<IReportForPrint>;
  },
};
