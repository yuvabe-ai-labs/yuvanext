import axiosInstance from "@/config/platform-api";
import { handleApiError } from "@/lib/api-handler";
import type { 
  MentorIncomingRequestsResponse, 
  MentorListResponse 
} from "@/types/mentorship.types";

// --- Mentor Services ---

export const getIncomingRequests = async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
  try {
    const response = await axiosInstance.get<MentorIncomingRequestsResponse>("/mentorship-requests/incoming", { params });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch mentorship requests");
  }
};

export const respondToMentorshipRequest = async (payload: { requestId: string; action: "accept" | "reject"; rejectionReason?: string }) => {
  try {
    const response = await axiosInstance.put("/mentorship-requests/respond", payload);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to respond to request");
  }
};


export const getMentorUnitCandidates = async (
  unitId: string, 
  params?: { page?: number; limit?: number; search?: string; status?: string }
) => {
  try {
    // Pass filter and unitId inside the params object so axios attaches them to the URL query string
    const response = await axiosInstance.get(`/mentor/accepted-candidates`, { 
      params: { 
        ...params, 
        filter: "unit", 
        unitId: unitId 
      } 
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch unit candidates");
  }
};

export const getMentorHiredCandidates = async (
  unitId: string, 
  params?: { page?: number; limit?: number; search?: string; status?: string }
) => {
  try {
    // Pass filter and unitId inside the params object so axios attaches them to the URL query string
    const response = await axiosInstance.get(`/mentor/accepted-candidates`, { 
      params: { 
        ...params, 
        filter: "unit", 
        unitId: unitId 
      } 
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch unit candidates");
  }
};