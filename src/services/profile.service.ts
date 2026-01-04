import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type { Profile } from "@/types/profile.types";

// 1. Fetch Unit Profile
export const getUnitProfile = async (): Promise<Profile> => {
  try {
    const response = await axiosInstance.get("/profile");
    // Ensure the fallback object matches the empty state of your type
    return handleApiResponse<Profile>(response, {} as Profile);
  } catch (error) {
    return handleApiError(error, "Failed to fetch profile");
  }
};

// 2. Update Unit Profile
export const updateUnitProfile = async (
  updates: Partial<Profile>
): Promise<Profile> => {
  try {
    // Send partial updates; backend handles merging
    const response = await axiosInstance.put("/profile", updates);
    return handleApiResponse<Profile>(response, {} as Profile);
  } catch (error) {
    return handleApiError(error, "Failed to update profile");
  }
};
