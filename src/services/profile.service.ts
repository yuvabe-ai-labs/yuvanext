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
    // Note: Documentation says /api/unit/applications/status, NOT /api/unit/applications/{id}
    await axiosInstance.put("/unit/applications/status", payload);
  } catch (error) {
    return handleApiError(error, "Failed to update application status");
  }
};

import type { UserProfileDTO } from "@/types/profile.types"; // Updated import path

export const getUserProfile = async (): Promise<UserProfileDTO | null> => {
  try {
    const response = await axiosInstance.get("/profile");
    // This helper extracts response.data.data safely
    return handleApiResponse<UserProfileDTO>(response, null);
  } catch (error) {
    // Returns null on error so the UI can handle "no profile" gracefully
    return handleApiError(error, "Failed to fetch user profile");
  }
};
