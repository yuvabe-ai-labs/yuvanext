import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type { Profile } from "@/types/profile.types";
import type { UnitApplication } from "@/types/unit.types";

// 1. Fetch Unit Profile
export const getUnitProfile = async (): Promise<Profile> => {
  try {
    const response = await axiosInstance.get("/profile");
    return handleApiResponse<Profile>(response, {} as Profile);
  } catch (error) {
    return handleApiError(error, "Failed to fetch profile");
  }
};

import type { HiredCandidate, HiredCandidateDTO } from "@/types/unit.types";

export const getHiredApplicants = async (): Promise<HiredCandidateDTO[]> => {
  try {
    // 1. CALL THE NEW ENDPOINT
    // Using '/unit/tasks' as discussed for the tasks endpoint
    const response = await axiosInstance.get("/tasks");

    // 2. RETURN RAW DATA
    // We return the raw data directly without formatting, as requested
    return response.data?.data || [];
  } catch (error) {
    return handleApiError(error, "Failed to fetch hired applicants");
  }
};
