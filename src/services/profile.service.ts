import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type {
  Profile,
  UpdateApplicationStatusResponse,
  UpdateProfilePayload,
} from "@/types/profiles.types";
import type {
  UploadImagePayload,
  UploadImageResponse,
  CandidateProfileData,
  UpdateApplicationStatusPayload,
} from "@/types/profiles.types";

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

export const updateApplicationStatus = async (
  payload: UpdateApplicationStatusPayload
): Promise<UpdateApplicationStatusResponse> => {
  try {
    // Endpoint: PUT /api/unit/applications/status
    const response = await axiosInstance.put(
      "/unit/applications/status",
      payload
    );

    // Return typed response with a safe fallback
    return handleApiResponse<UpdateApplicationStatusResponse>(
      response,
      {} as UpdateApplicationStatusResponse
    );
  } catch (error) {
    return handleApiError(error, "Failed to update application status");
  }
};

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

export const uploadAvatar = async (
  file: File
): Promise<{ avatarUrl: string }> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post("/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Response data structure: { data: { avatarUrl: "..." } }
    return handleApiResponse<{ avatarUrl: string }>(response, {
      avatarUrl: "",
    });
  } catch (error) {
    return handleApiError(error, "Failed to upload avatar");
  }
};

export const deleteAvatar = async (): Promise<void> => {
  try {
    const response = await axiosInstance.delete("/profile/avatar");
    return handleApiResponse<void>(response, undefined);
  } catch (error) {
    return handleApiError(error, "Failed to delete avatar");
  }
};

// --- BANNER ENDPOINTS ---

export const uploadBanner = async (
  file: File
): Promise<{ bannerUrl: string }> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post("/profile/banner", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return handleApiResponse<{ bannerUrl: string }>(response, {
      bannerUrl: "",
    });
  } catch (error) {
    return handleApiError(error, "Failed to upload banner");
  }
};

export const deleteBanner = async (): Promise<void> => {
  try {
    const response = await axiosInstance.delete("/profile/banner");
    return handleApiResponse<void>(response, undefined);
  } catch (error) {
    return handleApiError(error, "Failed to delete banner");
  }
};

// --- GALLERY ENDPOINTS ---

export const uploadGalleryImage = async (
  file: File
): Promise<{ galleryImages: string[] }> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post("/profile/gallery", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return handleApiResponse<{ galleryImages: string[] }>(response, {
      galleryImages: [],
    });
  } catch (error) {
    return handleApiError(error, "Failed to upload gallery image");
  }
};

export const deleteGalleryImage = async (
  imageUrl: string
): Promise<{ galleryImages: string[] }> => {
  try {
    // Query param: ?imageUrl=...
    const response = await axiosInstance.delete(
      `/profile/gallery?imageUrl=${encodeURIComponent(imageUrl)}`
    );
    return handleApiResponse<{ galleryImages: string[] }>(response, {
      galleryImages: [],
    });
  } catch (error) {
    return handleApiError(error, "Failed to delete gallery image");
  }
};

// --- TESTIMONIAL / GLIMPSE VIDEO ENDPOINTS ---

export const uploadTestimonial = async (
  file: File
): Promise<{ galleryVideos: string[] }> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      "/profile/testimonial",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return handleApiResponse<{ galleryVideos: string[] }>(response, {
      galleryVideos: [],
    });
  } catch (error) {
    return handleApiError(error, "Failed to upload video");
  }
};

export const deleteTestimonial = async (
  videoUrl: string
): Promise<{ galleryVideos: string[] }> => {
  try {
    const response = await axiosInstance.delete(
      `/profile/testimonial?videoUrl=${encodeURIComponent(videoUrl)}`
    );
    return handleApiResponse<{ galleryVideos: string[] }>(response, {
      galleryVideos: [],
    });
  } catch (error) {
    return handleApiError(error, "Failed to delete video");
  }
};
