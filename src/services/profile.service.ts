import axiosInstance from "@/config/platform-api";
import type { Profile } from "@/types/profiles.types";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";

// Get Profile

export const getProfile = async (): Promise<Profile> => {
  try {
    const response = await axiosInstance.get("/profile");
    return handleApiResponse<Profile>(response, {} as Profile);
  } catch (error) {
    return handleApiError(error, "Failed to fetch profile");
  }
};
