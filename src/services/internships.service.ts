import axiosInstance from "@/config/platform-api";
import type { Internship } from "@/types/internships.types";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";

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
