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
} from "@/lib/types";

export const salaryReportService = {
  // Generate report for single employee
  generate: async (data: IGenerateReport) => {
    const response = await apiClient.post<{
      message: string;
      data: ISalaryReport;
    }>("/salary-reports/generate", data);

    return {
      data: response.data.data,
      message: response.data.message,
      status: 200,
    } as IResponse<ISalaryReport>;
  },

  // Generate reports for all employees
  generateAll: async (month: number, year: number) => {
    const response = await apiClient.post<{
      message: string;
      data: {
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
      };
    }>("/salary-reports/generate-all", { month, year });

    return {
      data: response.data.data,
      message: response.data.message,
      status: 200,
    } as IResponse<typeof response.data.data>;
  },

  // Get all reports
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

  // Search reports
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

  // Get report by ID
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

  // Get summary
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

  // Get report for print
  getForPrint: async (id: string) => {
    const url = `/salary-reports/${id}/print`;
    console.log("PRINT URL 👉", url);

    const response = await apiClient.get<{ data: IReportForPrint }>(url);

    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<IReportForPrint>;
  },

  // Delete report
  delete: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(
      `/salary-reports/${id}`,
    );
    return {
      message: response.data.message,
      status: 200,
    } as IResponse;
  },

  // Regenerate report
  regenerate: async (data: IGenerateReport) => {
    const response = await apiClient.post<{
      message: string;
      data: ISalaryReport;
    }>("/salary-reports/regenerate", data);

    return {
      data: response.data.data,
      message: response.data.message,
      status: 200,
    } as IResponse<ISalaryReport>;
  },
};
