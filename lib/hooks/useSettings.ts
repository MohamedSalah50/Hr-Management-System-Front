// lib/hooks/useSettings.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "../api/services/settings.service";
import {
  ICreateSetting,
  IOvertimeDeductionSettings,
  IWeekendSettings,
} from "../types/api.types";

export const SETTINGS_KEYS = {
  all: ["settings"] as const,
  lists: () => [...SETTINGS_KEYS.all, "list"] as const,
  detail: (key: string) => [...SETTINGS_KEYS.all, "detail", key] as const,
  overtimeDeduction: () =>
    [...SETTINGS_KEYS.all, "overtime-deduction"] as const,
  weekend: () => [...SETTINGS_KEYS.all, "weekend"] as const,
  general: () => [...SETTINGS_KEYS.all, "general"] as const,
};

export const useSettings = () => {
  return useQuery({
    queryKey: SETTINGS_KEYS.lists(),
    queryFn: () => settingsService.getAll(),
  });
};

export const useSetting = (key: string) => {
  return useQuery({
    queryKey: SETTINGS_KEYS.detail(key),
    queryFn: () => settingsService.getByKey(key),
    enabled: !!key,
  });
};

export const useOvertimeDeductionSettings = () => {
  return useQuery({
    queryKey: SETTINGS_KEYS.overtimeDeduction(),
    queryFn: () => settingsService.getOvertimeDeduction(),
  });
};

export const useWeekendSettings = () => {
  return useQuery({
    queryKey: SETTINGS_KEYS.weekend(),
    queryFn: () => settingsService.getWeekend(),
  });
};

export const useGeneralSettings = () => {
  return useQuery({
    queryKey: SETTINGS_KEYS.general(),
    queryFn: () => settingsService.getGeneral(),
  });
};

export const useUpsertSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateSetting) => settingsService.upsert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.lists() });
    },
  });
};

export const useSaveOvertimeDeduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IOvertimeDeductionSettings) =>
      settingsService.saveOvertimeDeduction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SETTINGS_KEYS.overtimeDeduction(),
      });
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.general() });
    },
  });
};

export const useSaveWeekend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IWeekendSettings) => settingsService.saveWeekend(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.weekend() });
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.general() });
    },
  });
};

export const useDeleteSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => settingsService.delete(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.lists() });
    },
  });
};

// ============= lib/hooks/useRolePermission.ts =============

import {
  roleService,
  // permissionService,
} from "../api/services/role.service";
import {
  ICreateRole,
  IUpdateRole,
  // ICreatePermission,
  // IUpdatePermission,
} from "../types/api.types";

export const ROLE_KEYS = {
  all: ["roles"] as const,
  lists: () => [...ROLE_KEYS.all, "list"] as const,
  details: () => [...ROLE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...ROLE_KEYS.details(), id] as const,
};

// export const PERMISSION_KEYS = {
//   all: ["permissions"] as const,
//   lists: () => [...PERMISSION_KEYS.all, "list"] as const,
//   details: () => [...PERMISSION_KEYS.all, "detail"] as const,
//   detail: (id: string) => [...PERMISSION_KEYS.details(), id] as const,
//   byResource: (resource: string) =>
//     [...PERMISSION_KEYS.all, "resource", resource] as const,
// };

export const useRoles = () => {
  return useQuery({
    queryKey: ROLE_KEYS.lists(),
    queryFn: () => roleService.getAll(),
  });
};

export const useRole = (id: string) => {
  return useQuery({
    queryKey: ROLE_KEYS.detail(id),
    queryFn: () => roleService.getById(id),
    enabled: !!id,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateRole) => roleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.lists() });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateRole }) =>
      roleService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: ROLE_KEYS.detail(variables.id),
      });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => roleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.lists() });
    },
  });
};

// export const usePermissions = () => {
//   return useQuery({
//     queryKey: PERMISSION_KEYS.lists(),
//     queryFn: () => permissionService.getAll(),
//   });
// };

// export const usePermission = (id: string) => {
//   return useQuery({
//     queryKey: PERMISSION_KEYS.detail(id),
//     queryFn: () => permissionService.getById(id),
//     enabled: !!id,
//   });
// };

// export const usePermissionsByResource = (resource: string) => {
//   return useQuery({
//     queryKey: PERMISSION_KEYS.byResource(resource),
//     queryFn: () => permissionService.getByResource(resource),
//     enabled: !!resource,
//   });
// };

// export const useCreatePermission = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (data: ICreatePermission) => permissionService.create(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: PERMISSION_KEYS.lists() });
//     },
//   });
// };

// export const useUpdatePermission = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ id, data }: { id: string; data: IUpdatePermission }) =>
//       permissionService.update(id, data),
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: PERMISSION_KEYS.lists() });
//       queryClient.invalidateQueries({
//         queryKey: PERMISSION_KEYS.detail(variables.id),
//       });
//     },
//   });
// };

// export const useDeletePermission = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (id: string) => permissionService.delete(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: PERMISSION_KEYS.lists() });
//     },
//   });
// };

// ============= lib/hooks/useOfficialHoliday.ts =============

import { officialHolidayService } from "../api/services/official-holiday.service";
import {
  ICreateOfficialHoliday,
  IUpdateOfficialHoliday,
} from "../types/api.types";

export const HOLIDAY_KEYS = {
  all: ["official-holidays"] as const,
  lists: () => [...HOLIDAY_KEYS.all, "list"] as const,
  list: (year?: number) => [...HOLIDAY_KEYS.lists(), { year }] as const,
  details: () => [...HOLIDAY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...HOLIDAY_KEYS.details(), id] as const,
};

export const useOfficialHolidays = (year?: number) => {
  return useQuery({
    queryKey: HOLIDAY_KEYS.list(year),
    queryFn: () => officialHolidayService.getAll(year),
  });
};

export const useOfficialHoliday = (id: string) => {
  return useQuery({
    queryKey: HOLIDAY_KEYS.detail(id),
    queryFn: () => officialHolidayService.getById(id),
    enabled: !!id,
  });
};

export const useCreateOfficialHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateOfficialHoliday) =>
      officialHolidayService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOLIDAY_KEYS.lists() });
    },
  });
};

export const useUpdateOfficialHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateOfficialHoliday }) =>
      officialHolidayService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: HOLIDAY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: HOLIDAY_KEYS.detail(variables.id),
      });
    },
  });
};

export const useDeleteOfficialHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => officialHolidayService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOLIDAY_KEYS.lists() });
    },
  });
};
