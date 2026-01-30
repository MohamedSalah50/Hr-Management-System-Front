import { ICreatePermission, IPaginatedResponse, IPermission, IResponse, IUpdatePermission } from "@/lib/types";
import { apiClient } from "../client";

export const permissionService = {
    create: async (data: ICreatePermission) => {
        const response = await apiClient.post<IResponse<IPermission[]>>(`/permissions`, data);
        return response.data;
    },

    getAll: async () => {
        const response = await apiClient.get<{ data: IPermission[], total: number }>('/permissions');
        return {
            data: {
                data: response.data.data,
                total: response.data.total
            },
            message: "done",
            status: 200
        } as IResponse<IPaginatedResponse<IPermission>>
    },

    getByResource: async (resource: string) => {
        const response = await apiClient.get<{ data: IPermission[], total: number }>(`/permissions?resource=${resource}`)

        return {
            data: {
                data: response.data.data,
                total: response.data.total
            },
            message: "done",
            status: 200
        } as IResponse<IPaginatedResponse<IPermission>>
    },

    getById: async (id: string) => {
        const response = await apiClient.get<{ data: IPermission }>(`/permissions/${id})`);
        return {

            data: response.data.data,
            message: "success",
            status: 200
        } as IResponse<IPermission>
    },

    update: async (id: string, data: IUpdatePermission) => {
        const response = await apiClient.patch<IResponse<IPermission>>(`/permissions/${id}`, data)
        return response.data
    },

    delete: async (id: string) => {
        const response = await apiClient.patch<IResponse>(`/permissions/${id}/soft-delete`)
        return response.data
    }


}