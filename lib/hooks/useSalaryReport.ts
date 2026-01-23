// lib/hooks/useSalaryReport.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { salaryReportService } from "../api/services/salary-report.service";
import { IGenerateReport, ISearchReport } from "../types";

export const SALARY_REPORT_KEYS = {
  all: ["salary-reports"] as const,
  lists: () => [...SALARY_REPORT_KEYS.all, "list"] as const,
  list: (filters?: ISearchReport) =>
    [...SALARY_REPORT_KEYS.lists(), { filters }] as const,
  details: () => [...SALARY_REPORT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...SALARY_REPORT_KEYS.details(), id] as const,
  summary: (month: number, year: number) =>
    [...SALARY_REPORT_KEYS.all, "summary", month, year] as const,
  print: (id: string) => [...SALARY_REPORT_KEYS.all, "print", id] as const,
};

// Get all reports
export const useSalaryReports = () => {
  return useQuery({
    queryKey: SALARY_REPORT_KEYS.lists(),
    queryFn: () => salaryReportService.getAll(),
  });
};

// Get report by ID
export const useSalaryReport = (id: string) => {
  return useQuery({
    queryKey: SALARY_REPORT_KEYS.detail(id),
    queryFn: () => salaryReportService.getById(id),
    enabled: !!id,
  });
};

// Search reports
export const useSearchSalaryReports = (searchData: ISearchReport) => {
  return useQuery({
    queryKey: SALARY_REPORT_KEYS.list(searchData),
    queryFn: () => salaryReportService.search(searchData),
    enabled: Object.keys(searchData).length > 0,
  });
};

// Get summary
export const useSalarySummary = (month: number, year: number) => {
  return useQuery({
    queryKey: SALARY_REPORT_KEYS.summary(month, year),
    queryFn: () => salaryReportService.getSummary(month, year),
    enabled: !!month && !!year,
  });
};

// Get report for print
export const useReportForPrint = (id: string) => {
  return useQuery({
    queryKey: SALARY_REPORT_KEYS.print(id),
    queryFn: () => salaryReportService.getForPrint(id),
    enabled: !!id,
  });
};

// Generate report
export const useGenerateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IGenerateReport) => salaryReportService.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALARY_REPORT_KEYS.lists() });
    },
  });
};

// Generate all reports
export const useGenerateAllReports = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ month, year }: { month: number; year: number }) =>
      salaryReportService.generateAll(month, year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALARY_REPORT_KEYS.lists() });
    },
  });
};

// Delete report
export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salaryReportService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALARY_REPORT_KEYS.lists() });
    },
  });
};

// Regenerate report
export const useRegenerateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IGenerateReport) => salaryReportService.regenerate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALARY_REPORT_KEYS.lists() });
    },
  });
};
