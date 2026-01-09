import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type { Profile } from "@/types/profile.types";
import type {
  UploadImagePayload,
  UploadImageResponse,
} from "@/types/profile.types";

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

import type {
  CandidateProfileData,
  UpdateApplicationStatusPayload,
} from "@/types/profile.types";

// Get Candidate Profile by Application ID
export const getCandidateProfile = async (
  applicationId: string
): Promise<CandidateProfileData> => {
  try {
    const response = await axiosInstance.get(
      `/unit/applications/${applicationId}`
    );
    return handleApiResponse<CandidateProfileData>(
      response,
      {} as CandidateProfileData
    );
  } catch (error) {
    return handleApiError(error, "Failed to fetch candidate profile");
  }
};

// Update Application Status (Handles Interview Scheduling too)
export const updateApplicationStatus = async (
  payload: UpdateApplicationStatusPayload
): Promise<void> => {
  try {
    // Endpoint: PUT /api/unit/applications/status
    // Note: Documentation says /api/unit/applications/status
    await axiosInstance.put("/unit/applications/status", payload);
  } catch (error) {
    return handleApiError(error, "Failed to update application status");
  }
};

export const uploadImage = async ({
  file,
  type,
  userId,
}: UploadImagePayload): Promise<UploadImageResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("userId", userId);

    const response = await axiosInstance.put("/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return handleApiResponse<UploadImageResponse>(response, { url: "" });
  } catch (error) {
    return handleApiError(error, "Failed to upload image");
  }
};
