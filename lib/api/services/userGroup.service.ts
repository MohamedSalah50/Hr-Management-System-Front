// lib/api/services/user-group.service.ts

import { apiClient } from "../client";
import {
  IResponse,
  IPaginatedResponse,
  IUserGroup,
  ICreateUserGroup,
  IUpdateUserGroup,
} from "@/lib/types/api.types";

export const userGroupService = {
  // Create user group - Backend returns { message, data }
  create: async (data: ICreateUserGroup) => {
    const response = await apiClient.post<IResponse<IUserGroup[]>>(
      "/user-groups",
      data,
    );
    return response.data;
  },

  // Get all user groups - Backend returns { data, total }
  getAll: async () => {
    const response = await apiClient.get<{
      data: IUserGroup[];
      total: number;
    }>("/user-groups");

    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<IUserGroup>>;
  },

  // Get user group by ID - Backend returns { data }
  getById: async (id: string) => {
    const response = await apiClient.get<{ data: IUserGroup }>(
      `/user-groups/${id}`,
    );
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<IUserGroup>;
  },

  // Update user group - Backend returns { message, data }
  update: async (id: string, data: IUpdateUserGroup) => {
    const response = await apiClient.patch<IResponse<IUserGroup>>(
      `/user-groups/${id}`,
      data,
    );
    return response.data;
  },

  // Delete user group - Backend returns { message }
  delete: async (id: string) => {
    const response = await apiClient.patch<IResponse>(`/user-groups/${id}/soft-delete`);
    return response.data;
  },

  // Add users to group - Backend returns { message, data }
  addUsers: async (groupId: string, userIds: string[]) => {
    const response = await apiClient.post<IResponse<IUserGroup>>(
      `/user-groups/${groupId}/users`,
      { userIds },
    );
    return response.data;
  },

  // Remove users from group - Backend returns { message, data }
  removeUsers: async (groupId: string, userIds: string[]) => {
    const response = await apiClient.delete<IResponse<IUserGroup>>(
      `/user-groups/${groupId}/users`,
      { data: { userIds } },
    );
    return response.data;
  },

  // Add permissions to group - Backend returns { message, data }
  addPermissions: async (groupId: string, permissions: string[]) => {
    const response = await apiClient.post<IResponse<IUserGroup>>(
      `/user-groups/${groupId}/permissions`,
      { permissions },
    );
    return response.data;
  },

  // Remove permissions from group - Backend returns { message, data }
  removePermissions: async (groupId: string, permissions: string[]) => {
    const response = await apiClient.delete<IResponse<IUserGroup>>(
      `/user-groups/${groupId}/permissions`,
      { data: { permissions } },
    );
    return response.data;
  },
};
