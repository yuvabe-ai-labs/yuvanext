import axiosInstance from "@/config/platform-api";
import type { Profile, UpdateProfilePayload } from "@/types/profiles.types";
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

export const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<Profile> => {
  try {
    const response = await axiosInstance.put("/profile", payload);
    return handleApiResponse<Profile>(response, {} as Profile);
  } catch (error) {
    return handleApiError(error, "Failed to update profile");
  }
};
