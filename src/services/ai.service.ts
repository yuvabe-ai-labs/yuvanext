import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type {
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
