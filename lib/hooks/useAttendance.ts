// lib/hooks/useAttendance.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "../api/services/attendance.service";
import {
  ICreateAttendance,
  IUpdateAttendance,
  ISearchAttendance,
} from "../types/api.types";

export const ATTENDANCE_KEYS = {
  all: ["attendance"] as const,
  lists: () => [...ATTENDANCE_KEYS.all, "list"] as const,
  list: (filters?: ISearchAttendance) =>
    [...ATTENDANCE_KEYS.lists(), { filters }] as const,
  details: () => [...ATTENDANCE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...ATTENDANCE_KEYS.details(), id] as const,
  statistics: (employeeId: string, month: number, year: number) =>
    [...ATTENDANCE_KEYS.all, "statistics", employeeId, month, year] as const,
};

// Get all attendance records
export const useAttendanceRecords = () => {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.lists(),
    queryFn: () => attendanceService.getAll(),
  });
};

// Get attendance by ID
export const useAttendance = (id: string) => {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.detail(id),
    queryFn: () => attendanceService.getById(id),
    enabled: !!id,
  });
};

// Search attendance
export const useSearchAttendance = (searchData: ISearchAttendance) => {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.list(searchData),
    queryFn: () => attendanceService.search(searchData),
    enabled: Object.keys(searchData).length > 0,
  });
};

// Get statistics
export const useAttendanceStatistics = (
  employeeId: string,
  month: number,
  year: number,
) => {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.statistics(employeeId, month, year),
    queryFn: () => attendanceService.getStatistics(employeeId, month, year),
    enabled: !!employeeId && !!month && !!year,
  });
};

// ✅ FIX: Create attendance with proper invalidation
export const useCreateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateAttendance) => attendanceService.create(data),
    onSuccess: () => {
      // Invalidate immediately to refetch with populated data
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.lists() });
    },
  });
};

// ✅ FIX: Update attendance with proper invalidation
export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateAttendance }) =>
      attendanceService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: ATTENDANCE_KEYS.detail(variables.id),
      });
    },
  });
};

// Delete attendance
export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => attendanceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.lists() });
    },
  });
};

// Import from Excel
export const useImportAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => attendanceService.importExcel(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.lists() });
    },
  });
};

// Export to Excel
export const useExportAttendance = () => {
  return useMutation({
    mutationFn: (searchData: ISearchAttendance) =>
      attendanceService.exportExcel(searchData),
  });
};