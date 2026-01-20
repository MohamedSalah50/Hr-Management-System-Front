// lib/hooks/useEmployee.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "../api/services/employee.service";
import { ICreateEmployee, IUpdateEmployee } from "../types/api.types";

export const EMPLOYEE_KEYS = {
  all: ["employees"] as const,
  lists: () => [...EMPLOYEE_KEYS.all, "list"] as const,
  list: (filters?: string) => [...EMPLOYEE_KEYS.lists(), { filters }] as const,
  details: () => [...EMPLOYEE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...EMPLOYEE_KEYS.details(), id] as const,
  byDepartment: (departmentId: string) =>
    [...EMPLOYEE_KEYS.all, "department", departmentId] as const,
  search: (query: string) => [...EMPLOYEE_KEYS.all, "search", query] as const,
};

// Get all employees
export const useEmployees = () => {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.lists(),
    queryFn: () => employeeService.getAll(),
  });
};

// Get employee by ID
export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.detail(id),
    queryFn: () => employeeService.getById(id),
    enabled: !!id,
  });
};

// Search employees
export const useSearchEmployees = (query: string) => {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.search(query),
    queryFn: () => employeeService.search(query),
    enabled: !!query && query.length > 0,
  });
};

// Get employees by department
export const useEmployeesByDepartment = (departmentId: string) => {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.byDepartment(departmentId),
    queryFn: () => employeeService.getByDepartment(departmentId),
    enabled: !!departmentId,
  });
};

// Create employee
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateEmployee) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
    },
  });
};

// Update employee
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateEmployee }) =>
      employeeService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: EMPLOYEE_KEYS.detail(variables.id),
      });
    },
  });
};

// Delete employee
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
    },
  });
};

// Toggle employee status
export const useToggleEmployeeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeService.toggleStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.detail(id) });
    },
  });
};
