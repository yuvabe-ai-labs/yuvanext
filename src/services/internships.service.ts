import axiosInstance from "@/config/platform-api";
import type {
  Internship,
  SavedInternships,
  AppliedInternships,
  SavedAndAppliedCount,
} from "@/types/internships.types";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";

// Get all internships

export const getInternships = async (): Promise<Internship[]> => {
  try {
    const response = await axiosInstance.get("/internships");
    return handleApiResponse<Internship[]>(response, []);
  } catch (error) {
    return handleApiError(error, "Failed to fetch internships");
  }
};

// Get internship by id

export const getInternshipById = async (id: string): Promise<Internship> => {
  try {
    const response = await axiosInstance.get(`/internships/${id}`);
    return handleApiResponse<Internship>(response, {} as Internship);
  } catch (error) {
    return handleApiError(error, `Failed to fetch internships ${id}`);
  }
};

// Get recommended internships

export const getRemommendedInternships = async (): Promise<Internship[]> => {
  try {
    const response = await axiosInstance.get("/internships/recommended");
    return handleApiResponse<Internship[]>(response, []);
  } catch (error) {
    return handleApiError(error, "Failed to fetch recommended internships");
  }
};

// Get Saved internships

export const getSavedInternships = async (): Promise<SavedInternships[]> => {
  try {
    const response = await axiosInstance.get("/candidate/internship/save");
    return handleApiResponse<SavedInternships[]>(response, []);
  } catch (error) {
    return handleApiError(error, "Failed to fetch Saved internships");
  }
};

// Get Applied internships

export const getAppliedInternships = async (): Promise<
  AppliedInternships[]
> => {
  try {
    const response = await axiosInstance.get("/candidate/internship/apply");
    return handleApiResponse<AppliedInternships[]>(response, []);
  } catch (error) {
    return handleApiError(error, "Failed to fetch Applied internships");
  }
};

// Get Saved & and Applied Count

export const getSaveAndAppliedCount =
  async (): Promise<SavedAndAppliedCount> => {
    try {
      const response = await axiosInstance.get("/candidate/internship/counts");
      return handleApiResponse<SavedAndAppliedCount>(
        response,
        {} as SavedAndAppliedCount
      );
    } catch (error) {
      return handleApiError(error, "Failed to fetch internships count");
    }
  };
