import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type { Profile } from "@/types/profiles.types";

// 1. Fetch Unit Profile
export const getUnitProfile = async (): Promise<Profile> => {
  try {
    const response = await axiosInstance.get("/profile");
    return handleApiResponse<Profile>(response, {} as Profile);
  } catch (error) {
    return handleApiError(error, "Failed to fetch profile");
  }
};
import type { HiredCandidateDTO } from "@/types/unit.types";

export const getHiredApplicants = async (): Promise<HiredCandidateDTO[]> => {
  try {
    // Using '/tasks' as requested
    const response = await axiosInstance.get("/tasks");

    // Safely unwrap data with a fallback of []
    return handleApiResponse<HiredCandidateDTO[]>(response, []);
  } catch (error) {
    return handleApiError(error, "Failed to fetch hired applicants");
  }
};
