import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type { Profile } from "@/types/profile.types";
import type { UnitApplication } from "@/types/unit.types";

// 1. Fetch Unit Profile
export const getUnitProfile = async (): Promise<Profile> => {
  try {
    const response = await axiosInstance.get("/profile");
    return handleApiResponse<Profile>(response, {} as Profile);
  } catch (error) {
    return handleApiError(error, "Failed to fetch profile");
  }
};

// 2. Fetch, Filter, and Format Hired Applicants
export const getHiredApplicants = async (): Promise<UnitApplication[]> => {
  try {
    const response = await axiosInstance.get("/unit/applications");

    // Access the nested data correctly based on your previous logs
    // The generic handleApiResponse might handle the first .data,
    // but typically axios returns { data: { data: [...] } }
    const rawData = response.data?.data || [];

    // Filter for HIRED & ACCEPTED
    const hiredApps = rawData.filter((item) => {
      const app = item.application;
      return (
        app?.status === "hired" && app?.candidateOfferDecision === "accept"
      );
    });

    // Normalize Data Structure
    const formatted: UnitApplication[] = hiredApps.map((item) => ({
      application_id: item.application.id,
      status: item.application.status,
      offer_decision: item.application.candidateOfferDecision,

      // Internship object
      internship: item.internship || {},

      // Candidate object (normalized)
      student: {
        full_name: item.candidate?.name || "Unknown",
        avatar_url: item.candidate?.avatarUrl || item.candidate?.image || null,
        id: item.candidate?.userId,
        email: item.candidate?.email,
        phone: item.candidate?.phone,
      },
    }));

    return formatted;
  } catch (error) {
    return handleApiError(error, "Failed to fetch hired applicants");
  }
};
