import axiosInstance from "@/config/platform-api";
import { handleApiError } from "@/lib/api-handler";
import { GetMentorsParams } from "@/types/candidates.types";

export const getAvailableMentors = async (params: GetMentorsParams) => {
  try {
    const response = await axiosInstance.get("/candidate/mentors", { params });
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
    // If it's a 409 Conflict (already requested/accepted), pass the message up
    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to send mentorship request");
  }
};


export const getMentorById = async (mentorId: string) => {
  try {
    const response = await axiosInstance.get(`/candidate/mentors/${mentorId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch mentor details");
  }
};

export const getCandidateOwnRequests = async (params?: { page?: number; limit?: number; status?: string }) => {
  try {
    const response = await axiosInstance.get("/candidate/mentorship-requests", { params });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch your requests");
  }
};