// lib/hooks/useDepartment.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { departmentService } from "../api/services/department.service";
import { ICreateDepartment, IUpdateDepartment } from "../types/api.types";

export const DEPARTMENT_KEYS = {
  all: ["departments"] as const,
  lists: () => [...DEPARTMENT_KEYS.all, "list"] as const,
  list: (filters?: string) =>
    [...DEPARTMENT_KEYS.lists(), { filters }] as const,
  details: () => [...DEPARTMENT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...DEPARTMENT_KEYS.details(), id] as const,
};

// Get all departments
export const useDepartments = () => {
  return useQuery({
    queryKey: DEPARTMENT_KEYS.lists(),
    queryFn: () => departmentService.getAll(),
  });
};

// Get department by ID
export const useDepartment = (id: string) => {
  return useQuery({
    queryKey: DEPARTMENT_KEYS.detail(id),
    queryFn: () => departmentService.getById(id),
    enabled: !!id,
  });
};

// Create department
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateDepartment) => departmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.lists() });
    },
  });
};

// Update department
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateDepartment }) =>
      departmentService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: DEPARTMENT_KEYS.detail(variables.id),
      });
    },
  });
};

// Delete department
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => departmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.lists() });
    },
  });
};
