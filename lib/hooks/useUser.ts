// lib/hooks/useUser.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "../api/services/user.service";
import { ICreateUser, IUpdateUser, IChangePassword } from "../types/api.types";

export const USER_KEYS = {
  all: ["users"] as const,
  lists: () => [...USER_KEYS.all, "list"] as const,
  list: (filters?: string) => [...USER_KEYS.lists(), { filters }] as const,
  details: () => [...USER_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USER_KEYS.details(), id] as const,
  byRole: (roleId: string) => [...USER_KEYS.all, "role", roleId] as const,
  search: (query: string) => [...USER_KEYS.all, "search", query] as const,
};

// Get all users
export const useUsers = () => {
  return useQuery({
    queryKey: USER_KEYS.lists(),
    queryFn: () => userService.getAll(),
  });
};

// Get user by ID
export const useUser = (id: string) => {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
};

// Search users
export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: USER_KEYS.search(query),
    queryFn: () => userService.search(query),
    enabled: !!query && query.length > 0,
  });
};

// Get users by role
export const useUsersByRole = (roleId: string) => {
  return useQuery({
    queryKey: USER_KEYS.byRole(roleId),
    queryFn: () => userService.getByRole(roleId),
    enabled: !!roleId,
  });
};

// Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateUser) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
    },
  });
};

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateUser }) =>
      userService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.detail(variables.id),
      });
    },
  });
};

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
    },
  });
};

// Toggle user status
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.toggleStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(id) });
    },
  });
};

// Change password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: IChangePassword) => userService.changePassword(data),
  });
};
