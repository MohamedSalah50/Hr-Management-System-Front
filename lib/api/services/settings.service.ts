// lib/api/services/settings.service.ts

import { apiClient } from "../client";
import {
  IResponse,
  IPaginatedResponse,
  ISetting,
  ICreateSetting,
  IOvertimeDeductionSettings,
  IWeekendSettings,
  IGeneralSettings,
} from "@/lib/types/api.types";

export const settingsService = {
  // Create or update setting - Backend returns { message, data }
  upsert: async (data: ICreateSetting) => {
    const response = await apiClient.post<IResponse<ISetting[]>>(
      "/settings",
      data,
    );
    return response.data;
  },

  // Get all settings - Backend returns { data, total }
  getAll: async () => {
    const response = await apiClient.get<{
      data: ISetting[];
      total: number;
    }>("/settings");

    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<ISetting>>;
  },

  // Get setting by key - Backend returns { data }
  getByKey: async (key: string) => {
    const response = await apiClient.get<{ data: ISetting }>(
      `/settings/${key}`,
    );
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<ISetting>;
  },

  // Delete setting - Backend returns { message }
  delete: async (key: string) => {
    const response = await apiClient.delete<IResponse>(`/settings/${key}`);
    return response.data;
  },

  // Save overtime & deduction settings - Backend returns { message, data }
  saveOvertimeDeduction: async (data: IOvertimeDeductionSettings) => {
    const response = await apiClient.put<IResponse<IOvertimeDeductionSettings>>(
      "/settings/overtime-deduction",
      data,
    );
    return response.data;
  },

  // Get overtime & deduction settings - Backend returns { data }
  getOvertimeDeduction: async () => {
    const response = await apiClient.get<{ data: IOvertimeDeductionSettings }>(
      "/settings/overtime-deduction/current",
    );
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<IOvertimeDeductionSettings>;
  },

  // Save weekend settings - Backend returns { message, data }
  saveWeekend: async (data: IWeekendSettings) => {
    const response = await apiClient.put<IResponse<IWeekendSettings>>(
      "/settings/weekend",
      data,
    );
    return response.data;
  },

  // Get weekend settings - Backend returns { data }
  getWeekend: async () => {
    const response = await apiClient.get<{ data: IWeekendSettings }>(
      "/settings/weekend/current",
    );
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<IWeekendSettings>;
  },

  // Get general settings (combined) - Backend returns { data }
  getGeneral: async () => {
    const response = await apiClient.get<{ data: IGeneralSettings }>(
      "/settings/general",
    );
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<IGeneralSettings>;
  },
};
