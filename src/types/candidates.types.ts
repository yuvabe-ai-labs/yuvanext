import axiosInstance from "@/config/platform-api";
import { handleApiError } from "@/lib/api-handler";


export interface MentorListItem {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  mentorType: string | null;
  expertiseAreas: string[] | null;
  experienceSnapshot: string | null;
  availabilityDays: string[] | null;
  availabilityTimeWindows: { start: string; end: string }[] | null;
  timezone: string | null;
  mentoringCapacity: string | null;
  preferredStages: string[] | null;
  communicationModes: string[] | null;
  createdAt: string;
}

export interface GetMentorsParams {
  page?: number;
  limit?: number;
  search?: string;
  mentorType?: string;
  expertiseArea?: string;
  availabilityDay?: string;
}

