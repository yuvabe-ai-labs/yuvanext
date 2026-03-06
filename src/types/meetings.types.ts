export type MeetingStatus = "pending" | "completed" | "cancelled";

export type MeetingType = "zoom" | "in_person";

export type MeetingPurpose =
  | "weekly_check_in"
  | "progress_review"
  | "mid_point_evaluation"
  | "final_assessment"
  | "other";

export interface MeetingCandidate {
  userId: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  profileSummary: string | null;
  skills: string[];
  experienceLevel: string | null;
}

export interface Meeting {
  id: string;
  mentorId?: string;
  candidateId?: string;
  purpose: MeetingPurpose;
  meetingType: MeetingType;
  status: MeetingStatus;
  scheduledAt: string;
  durationMinutes: number | null;
  description: string | null;
  cancellationReason: string | null;
  location: string | null;
  zoomJoinUrl: string | null;
  zoomStartUrl: string | null;
  createdAt: string;
  updatedAt: string;
  candidate?: MeetingCandidate | null;
}

export interface MeetingsPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ListMeetingsData {
  data: Meeting[];
  pagination: MeetingsPagination;
}

export interface ListMeetingsParams {
  search?: string;
  status?: MeetingStatus;
  purpose?: MeetingPurpose;
  meetingType?: MeetingType;
  page?: number;
  limit?: number;
}

export interface CreateMeetingPayload {
  candidateId: string;
  meetingType: MeetingType;
  purpose: MeetingPurpose;
  scheduledAt: string;
  description?: string;
  durationMinutes?: number;
  location?: string;
  mentorId?: string;
}

export interface CancelMeetingPayload {
  meetingId: string;
  cancellationReason: string;
}

export interface CancelMeetingResponse {
  id: string;
  status: MeetingStatus;
  cancellationReason: string | null;
  zoomCancelled: boolean;
  notificationSent: boolean;
  emailSent: boolean;
  updatedAt: string;
}

