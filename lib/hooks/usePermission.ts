import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { permissionService } from "../api/services";
import { ICreatePermission, IUpdatePermission } from "../types";


export const PERMISSION_KEYS = {
    all: ["permissions"] as const,
    lists: () => [...PERMISSION_KEYS.all, "list"] as const,
    list: (filters?: string) => [...PERMISSION_KEYS.lists(), { filters }] as const,
    details: () => [...PERMISSION_KEYS.all, "detail"] as const,
    detail: (id: string) => [...PERMISSION_KEYS.details(), id] as const,
    byResource: (resource: string) => [...PERMISSION_KEYS.all, "resource", resource] as const,
};


export const usePermissions = () => {
    return useQuery({
        queryKey: PERMISSION_KEYS.lists(),
        queryFn: () => permissionService.getAll(),
    })

}


export const usePermissionsByResource = (resource: string) => {
    return useQuery({
        queryKey: PERMISSION_KEYS.byResource(resource),
        queryFn: () => permissionService.getByResource(resource),
        enabled: !!resource,
    })
}

export const usePermission = (id: string) => {
    return useQuery({
        queryKey: PERMISSION_KEYS.detail(id),
        queryFn: () => permissionService.getById(id),
        enabled: !!id,
    })
}


export const useCreatePermmission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ICreatePermission) => permissionService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PERMISSION_KEYS.lists() });
        },
    });
};

export const useUpdatePermission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: IUpdatePermission }) =>
            permissionService.update(id, data),
        onSuccess: (_, variables) => (
            queryClient.invalidateQueries({ queryKey: PERMISSION_KEYS.lists() }),
            queryClient.invalidateQueries({
                queryKey: PERMISSION_KEYS.detail(variables.id),
            })
        )

    });
};

export const useDeletePermission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => permissionService.delete(id),
        onSuccess: () => (
            queryClient.invalidateQueries({ queryKey: PERMISSION_KEYS.lists() })
        )
    })
}