import { PaginatedResponse } from "./mentor.types"; 

export type RequestStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface CandidateSnapshot {
  userId: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  profileSummary: string | null;
  skills: string[] | null;
  experienceLevel: string | null;
}

export interface MentorSnapshot {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  mentorType: string | null;
  expertiseAreas: string[] | null;
  experienceSnapshot: string | null;
}

export interface IncomingMentorshipRequest {
  id: string;
  status: RequestStatus;
  message: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  candidate: CandidateSnapshot;
}

export interface MentorListItem {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  mentorType: string | null;
  expertiseAreas: string[] | null;
  experienceSnapshot: string | null;
  mentoringCapacity: string | null;
}

// Responses
export type MentorIncomingRequestsResponse = PaginatedResponse<IncomingMentorshipRequest>;
export type MentorListResponse = PaginatedResponse<MentorListItem>;