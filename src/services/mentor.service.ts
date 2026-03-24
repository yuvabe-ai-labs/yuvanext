// services/mentor.service.ts
import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type { 
  MentorDashboardData, 
  MentorUnitsResponse, 
  MentorMeetingsResponse, 
  MentorAcceptedCandidatesResponse,
  MentorHiredCandidatesResponse,
  MentorStatsApiResponse
} from "@/types/mentor.types";

interface GetMentorUnitsParams {
  page?: number;
  limit?: number;
  search?: string;
}

// services/mentor.service.ts

interface GetAcceptedCandidatesParams {
  page?: number;
  limit?: number;
  search?: string;
}

// services/mentor.service.ts

interface GetApplicationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string; // Optional: in case you want to filter by status later
}

export const getAcceptedCandidatesApplicationsList = async (
  params?: GetApplicationsParams
) => {
  try {
    const response = await axiosInstance.get(
      "/mentor/accepted-candidates/applications",
      { params }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch candidate applications");
  }
};

export const getMentorStats = async (): Promise<MentorStatsApiResponse | null> => {
  try {
    const response = await axiosInstance.get("/mentor/stats");
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch mentor stats");
  }
};


export const getAcceptedCandidates = async (
  params?: GetAcceptedCandidatesParams
): Promise<MentorAcceptedCandidatesResponse | null> => {
  try {
    const response = await axiosInstance.get("/mentor/accepted-candidates", { params });
    // Return raw response.data to keep the pagination object
    return response.data; 
  } catch (error) {
    return handleApiError(error, "Failed to fetch accepted candidates");
  }
};

export const getMentorDashboardStats = async (): Promise<MentorDashboardData | null> => {
  try {
    const response = await axiosInstance.get("/mentor/dashboard");
    // This works because pagination is INSIDE the data object here
    return handleApiResponse<MentorDashboardData>(response, null);
  } catch (error) {
    return handleApiError(error, "Failed to fetch dashboard stats");
  }
};

export const getMentorUnits = async (params?: GetMentorUnitsParams): Promise<MentorUnitsResponse | null> => {
  try {
    // Add ?limit=1 so we only fetch 1 item just to get the totalItems count!
    const response = await axiosInstance.get("/mentor/units", { params });
    // Return the raw response.data so we don't lose the pagination object
    return response.data; 
  } catch (error) {
    return handleApiError(error, "Failed to fetch units");
  }
};

export const getMentorMeetings = async (): Promise<MentorMeetingsResponse | null> => {
  try {
    // Add ?limit=1 here too for performance
    const response = await axiosInstance.get("/meetings?limit=1");
    // Return the raw response.data so we don't lose the pagination object
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch meetings");
  }
};


export const getAcceptedCandidatesApplications = async (limit = 10) => {
  try {
    // We pass a limit parameter in case you want to fetch more at once for the slider
    const response = await axiosInstance.get(`/mentor/accepted-candidates/applications?limit=${limit}`);
    return response.data; // Return raw response to keep pagination data
  } catch (error) {
    return handleApiError(error, "Failed to fetch candidate applications");
  }
};


interface GetHiredCandidatesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getMentorHiredCandidates = async (
  params?: GetHiredCandidatesParams
): Promise<MentorHiredCandidatesResponse | null> => {
  try {
    const response = await axiosInstance.get("/mentor/hired-candidates", { params });
    // Returning raw response.data to keep the pagination object structured correctly
    return response.data; 
  } catch (error) {
    return handleApiError(error, "Failed to fetch hired candidates");
  }
};