import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type { UnitApplication, UnitDashboardStats } from "@/types/unit.types";

// Get Unit Dashboard Stats
export const getUnitStats = async (): Promise<UnitDashboardStats> => {
  try {
    const response = await axiosInstance.get("/internships/stats");
    // Assuming response.data.data contains the stats object based on your previous code
    return handleApiResponse<UnitDashboardStats>(
      response,
      {} as UnitDashboardStats
    );
  } catch (error) {
    return handleApiError(error, "Failed to fetch dashboard stats");
  }
};

// Get Unit Applications List
export const getUnitApplications = async (): Promise<UnitApplication[]> => {
  try {
    const response = await axiosInstance.get("/unit/applications");
    return handleApiResponse<UnitApplication[]>(response, []);
  } catch (error) {
    return handleApiError(error, "Failed to fetch unit applications");
  }
};
