import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type { InternshipApplicant } from "@/types/applicant.types";

export const getInternshipApplicants = async (
  internshipId: string
): Promise<InternshipApplicant[]> => {
  try {
    const response = await axiosInstance.get(
      `/unit/applications/internship/${internshipId}`
    );
    return handleApiResponse<InternshipApplicant[]>(response, []);
  } catch (error) {
    return handleApiError(error, "Failed to fetch applicants");
  }
};
