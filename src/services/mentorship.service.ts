import axiosInstance from "@/config/platform-api";
import { handleApiError } from "@/lib/api-handler";
import type { 
  MentorIncomingRequestsResponse, 
  MentorListResponse 
} from "@/types/mentorship.types";

// --- Mentor Services ---

export const getIncomingRequests = async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
  try {
    const response = await axiosInstance.get<MentorIncomingRequestsResponse>("/mentor/mentorship-requests", { params });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch mentorship requests");
  }
};

export const respondToMentorshipRequest = async (payload: { requestId: string; action: "accept" | "reject"; rejectionReason?: string }) => {
  try {
    const response = await axiosInstance.put("/mentor/mentorship-requests/respond", payload);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to respond to request");
  }
};

// --- Candidate Services ---

export const getAvailableMentors = async (params?: { page?: number; limit?: number; search?: string; mentorType?: string }) => {
  try {
    const response = await axiosInstance.get<MentorListResponse>("/candidate/mentors", { params });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch mentors");
  }
};

export const sendMentorshipRequest = async (payload: { mentorId: string; message?: string }) => {
  try {
    const response = await axiosInstance.post("/candidate/mentorship-requests", payload);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to send mentorship request");
  }
};

export const getMentorUnitCandidates = async (
  unitId: string, 
  params?: { page?: number; limit?: number; search?: string; status?: string }
) => {
  try {
    const response = await axiosInstance.get(`/mentor/units/${unitId}/candidates`, { params });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch unit candidates");
  }
};