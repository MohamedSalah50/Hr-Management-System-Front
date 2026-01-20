// lib/hooks/useSalaryReport.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { salaryReportService } from "../api/services/salary-report.service";
import { IGenerateReport, ISearchReport } from "../types/api.types";

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

// Get all salary reports
export const useSalaryReports = () => {
  return useQuery({
    queryKey: SALARY_REPORT_KEYS.lists(),
    queryFn: () => salaryReportService.getAll(),
  });
};

// Get salary report by ID
export const useSalaryReport = (id: string) => {
  return useQuery({
    queryKey: SALARY_REPORT_KEYS.detail(id),
    queryFn: () => salaryReportService.getById(id),
    enabled: !!id,
  });
};

// Search salary reports
export const useSearchSalaryReports = (searchData: ISearchReport) => {
  return useQuery({
    queryKey: SALARY_REPORT_KEYS.list(searchData),
    queryFn: () => salaryReportService.search(searchData),
    enabled: Object.keys(searchData).length > 0,
  });
};

// Get salary summary
export const useSalarySummary = (month: number, year: number) => {
  return useQuery({
    queryKey: SALARY_REPORT_KEYS.summary(month, year),
    queryFn: () => salaryReportService.getSummary(month, year),
    enabled: !!month && !!year,
  });
};

// Get report for print
export const useSalaryReportForPrint = (id: string) => {
  return useQuery({
    queryKey: SALARY_REPORT_KEYS.print(id),
    queryFn: () => salaryReportService.getForPrint(id),
    enabled: !!id,
  });
};

// Generate report
export const useGenerateSalaryReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IGenerateReport) => salaryReportService.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALARY_REPORT_KEYS.lists() });
    },
  });
};

// Generate all reports
export const useGenerateAllSalaryReports = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ month, year }: { month: number; year: number }) =>
      salaryReportService.generateAll(month, year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALARY_REPORT_KEYS.lists() });
    },
  });
};

// Regenerate report
export const useRegenerateSalaryReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IGenerateReport) => salaryReportService.regenerate(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SALARY_REPORT_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: SALARY_REPORT_KEYS.summary(variables.month, variables.year),
      });
    },
  });
};

// Delete salary report
export const useDeleteSalaryReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salaryReportService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALARY_REPORT_KEYS.lists() });
    },
  });
};
