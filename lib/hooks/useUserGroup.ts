// lib/hooks/useUserGroup.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userGroupService } from "../api/services/userGroup.service";
import { ICreateUserGroup, IUpdateUserGroup } from "../types/api.types";

export const USER_GROUP_KEYS = {
  all: ["user-groups"] as const,
  lists: () => [...USER_GROUP_KEYS.all, "list"] as const,
  list: (filters?: string) =>
    [...USER_GROUP_KEYS.lists(), { filters }] as const,
  details: () => [...USER_GROUP_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USER_GROUP_KEYS.details(), id] as const,
};

// Get all user groups
export const useUserGroups = () => {
  return useQuery({
    queryKey: USER_GROUP_KEYS.lists(),
    queryFn: () => userGroupService.getAll(),
  });
};

// Get user group by ID
export const useUserGroup = (id: string) => {
  return useQuery({
    queryKey: USER_GROUP_KEYS.detail(id),
    queryFn: () => userGroupService.getById(id),
    enabled: !!id,
  });
};

// Create user group
export const useCreateUserGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateUserGroup) => userGroupService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_GROUP_KEYS.lists() });
    },
  });
};

// Update user group
export const useUpdateUserGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateUserGroup }) =>
      userGroupService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_GROUP_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: USER_GROUP_KEYS.detail(variables.id),
      });
    },
  });
};

// Delete user group
export const useDeleteUserGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userGroupService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_GROUP_KEYS.lists() });
    },
  });
};

// Add users to group
export const useAddUsersToGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      userIds,
    }: {
      groupId: string;
      userIds: string[];
    }) => userGroupService.addUsers(groupId, userIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_GROUP_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: USER_GROUP_KEYS.detail(variables.groupId),
      });
    },
  });
};

// Remove users from group
export const useRemoveUsersFromGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      userIds,
    }: {
      groupId: string;
      userIds: string[];
    }) => userGroupService.removeUsers(groupId, userIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_GROUP_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: USER_GROUP_KEYS.detail(variables.groupId),
      });
    },
  });
};

// Add permissions to group
export const useAddPermissionsToGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      permissions,
    }: {
      groupId: string;
      permissions: string[];
    }) => userGroupService.addPermissions(groupId, permissions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_GROUP_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: USER_GROUP_KEYS.detail(variables.groupId),
      });
    },
  });
};

// Remove permissions from group
export const useRemovePermissionsFromGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      permissions,
    }: {
      groupId: string;
      permissions: string[];
    }) => userGroupService.removePermissions(groupId, permissions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_GROUP_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: USER_GROUP_KEYS.detail(variables.groupId),
      });
    },
  });
};
