import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type {
  EnhanceProfilePayload,
  EnhanceProfileResponse,
  GenerateContentPayload,
  GenerateContentResponse,
} from "@/types/ai.types";

export const generateInternshipContent = async (
  payload: GenerateContentPayload
): Promise<GenerateContentResponse> => {
  try {
    const response = await axiosInstance.post(
      "/unit/ai/generate-content",
      payload
    );
    return handleApiResponse<GenerateContentResponse>(response, {});
  } catch (error) {
    return handleApiError(error, "Failed to generate AI content");
  }
};

export const enhanceCandidateProfile = async (
  payload:EnhanceProfilePayload,
): Promise<EnhanceProfileResponse> => {
  try {
    const response = await axiosInstance.post(
      "/candidate/ai/enhance-profile",
      payload
    );

    return handleApiResponse<EnhanceProfileResponse>(response, {} as EnhanceProfileResponse);
  } catch (error) {
    return handleApiError(error, "Failed to enhance profile");
  }
};