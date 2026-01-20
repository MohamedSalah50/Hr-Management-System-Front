// lib/api/services/official-holiday.service.ts

import { apiClient } from "../client";
import {
  IResponse,
  IPaginatedResponse,
  IOfficialHoliday,
  ICreateOfficialHoliday,
  IUpdateOfficialHoliday,
} from "@/lib/types/api.types";

export const officialHolidayService = {
  // Create official holiday - Backend returns { message, data }
  create: async (data: ICreateOfficialHoliday) => {
    const response = await apiClient.post<IResponse<IOfficialHoliday[]>>(
      "/official-holidays",
      data,
    );
    return response.data;
  },

  // Get all official holidays - Backend returns { data, total }
  getAll: async (year?: number) => {
    const url = year ? `/official-holidays?year=${year}` : "/official-holidays";
    const response = await apiClient.get<{
      data: IOfficialHoliday[];
      total: number;
    }>(url);

    return {
      data: {
        data: response.data.data,
        total: response.data.total,
      },
      message: "success",
      status: 200,
    } as IResponse<IPaginatedResponse<IOfficialHoliday>>;
  },

  // Get official holiday by ID - Backend returns { data }
  getById: async (id: string) => {
    const response = await apiClient.get<{ data: IOfficialHoliday }>(
      `/official-holidays/${id}`,
    );
    return {
      data: response.data.data,
      message: "success",
      status: 200,
    } as IResponse<IOfficialHoliday>;
  },

  // Update official holiday - Backend returns { message, data }
  update: async (id: string, data: IUpdateOfficialHoliday) => {
    const response = await apiClient.patch<IResponse<IOfficialHoliday>>(
      `/official-holidays/${id}`,
      data,
    );
    return response.data;
  },

  // Delete official holiday - Backend returns { message }
  delete: async (id: string) => {
    const response = await apiClient.delete<IResponse>(
      `/official-holidays/${id}`,
    );
    return response.data;
  },
};
