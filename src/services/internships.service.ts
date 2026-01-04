import axiosInstance from "@/config/platform-api";
import type { Internship } from "@/types/internships.types";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type {
  CreateInternshipPayload,
  InternshipResponse,
} from "@/types/internships.types";

/**
 * Fetch all internships
 */
export const getInternships = async (): Promise<Internship[]> => {
  try {
    const response = await axiosInstance.get("/internships");
    return handleApiResponse<Internship[]>(response, []);
  } catch (error) {
    return handleApiError(error, "Failed to fetch internships");
  }
};

export const createInternship = async (
  payload: CreateInternshipPayload
): Promise<InternshipResponse> => {
  try {
    const response = await axiosInstance.post("/internships", payload);
    return handleApiResponse<InternshipResponse>(
      response,
      {} as InternshipResponse
    );
  } catch (error) {
    return handleApiError(error, "Failed to create internship");
  }
};

import type {
  UpdateInternshipPayload, // Import the new type
} from "@/types/internships.types";

export const updateInternship = async (
  payload: UpdateInternshipPayload
): Promise<InternshipResponse> => {
  try {
    // Destructure ID out because it goes in the URL, not the body (usually)
    const { id, ...data } = payload;

    // PUT /api/internships/{id}
    const response = await axiosInstance.put(`/internships/${id}`, data);

    return handleApiResponse<InternshipResponse>(
      response,
      {} as InternshipResponse
    );
  } catch (error) {
    return handleApiError(error, "Failed to update internship");
  }
};
