import axiosInstance from "@/config/platform-api";
import { handleApiError } from "@/lib/api-handler";
import type { MentorProfileData, UpdateMentorProfilePayload } from "@/types/mentor-profile.types";

export const getMentorProfileDetails = async (): Promise<MentorProfileData> => {
  try {
    const response = await axiosInstance.get("/profile/mentor");
    // Depending on your axios setup, the data might be directly in response.data
    return response.data?.data || response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch mentor profile");
  }
};

export const updateMentorProfileDetails = async (
  payload: UpdateMentorProfilePayload
): Promise<MentorProfileData> => {
  try {
    const response = await axiosInstance.put("/profile/mentor", payload);
    return response.data?.data || response.data;
  } catch (error) {
    return handleApiError(error, "Failed to update mentor profile");
  }
};