import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { officialHolidayService } from "../api/services/official-holiday.service";
import {
  ICreateOfficialHoliday,
  IUpdateOfficialHoliday,
} from "../types/api.types";

/* ================= Query Keys ================= */

export const OFFICIAL_HOLIDAY_KEYS = {
  all: ["official-holidays"] as const,
  lists: () => [...OFFICIAL_HOLIDAY_KEYS.all, "list"] as const,
  list: (year?: number) =>
    [...OFFICIAL_HOLIDAY_KEYS.lists(), { year }] as const,
  details: () => [...OFFICIAL_HOLIDAY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...OFFICIAL_HOLIDAY_KEYS.details(), id] as const,
};

/* ================= Queries ================= */

// Get all official holidays
export const useOfficialHolidays = (year?: number) => {
  return useQuery({
    queryKey: OFFICIAL_HOLIDAY_KEYS.list(year),
    queryFn: () => officialHolidayService.getAll(year),
  });
};

// Get official holiday by ID
export const useOfficialHoliday = (id: string) => {
  return useQuery({
    queryKey: OFFICIAL_HOLIDAY_KEYS.detail(id),
    queryFn: () => officialHolidayService.getById(id),
    enabled: !!id,
  });
};

/* ================= Mutations ================= */

// Create official holiday
export const useCreateOfficialHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateOfficialHoliday) =>
      officialHolidayService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: OFFICIAL_HOLIDAY_KEYS.lists(),
      });
    },
  });
};

// Update official holiday
export const useUpdateOfficialHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateOfficialHoliday }) =>
      officialHolidayService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: OFFICIAL_HOLIDAY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: OFFICIAL_HOLIDAY_KEYS.detail(variables.id),
      });
    },
  });
};

// Delete official holiday
export const useDeleteOfficialHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => officialHolidayService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: OFFICIAL_HOLIDAY_KEYS.lists(),
      });
    },
  });
};
