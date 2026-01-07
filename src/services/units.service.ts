import axiosInstance from "@/config/platform-api";
import type { Unit, UnitById } from "@/types/units.types";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";

// Get all units

export const getUnits = async (): Promise<Unit[]> => {
  try {
    const response = await axiosInstance.get("/units");
    return handleApiResponse<Unit[]>(response, []);
  } catch (error) {
    return handleApiError(error, "Failed to fetch units");
  }
};

// Get unit by id

export const getUnitById = async (id: string): Promise<UnitById> => {
  try {
    const response = await axiosInstance.get(`/units/${id}`);
    return handleApiResponse<UnitById>(response, {} as UnitById);
  } catch (error) {
    return handleApiError(error, `Failed to fetch unit ${id}`);
  }
};
