import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type {
  Interview,
  CreateInterviewPayload,
  UpdateInterviewPayload,
} from "@/types/interview.types";

// Get All Interviews (Optional filter by Application ID)
export const getInterviews = async (
  applicationId?: string
): Promise<Interview[]> => {
  try {
    const params = applicationId ? { application_id: applicationId } : {};
    const response = await axiosInstance.get("/interviews", { params });
    // Handle { data: [...] } or [...]
    return handleApiResponse<Interview[]>(response, []);
  } catch (error) {
    return handleApiError(error, "Failed to fetch interviews");
  }
};

// Create Interview
export const createInterview = async (
  payload: CreateInterviewPayload
): Promise<Interview> => {
  try {
    const response = await axiosInstance.post("/interviews", payload);
    return handleApiResponse<Interview>(response, {} as Interview);
  } catch (error) {
    return handleApiError(error, "Failed to schedule interview");
  }
};

// Update Interview
export const updateInterview = async (
  payload: UpdateInterviewPayload
): Promise<Interview> => {
  try {
    const { id, ...data } = payload;
    const response = await axiosInstance.put(`/interviews/${id}`, data);
    return handleApiResponse<Interview>(response, {} as Interview);
  } catch (error) {
    return handleApiError(error, "Failed to update interview");
  }
};

// Delete Interview
export const deleteInterview = async (id: string): Promise<void> => {
  try {
    const response = await axiosInstance.delete(`/interviews/${id}`);
    return handleApiResponse<void>(response, undefined);
  } catch (error) {
    return handleApiError(error, "Failed to delete interview");
  }
};
