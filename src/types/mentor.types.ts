export interface CandidateSnapshot {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  profileSummary: string | null;
  skills: string[] | null;
  experienceLevel: string | null;
}

export interface MentorDashboardData {
  totalAcceptedCandidates: number;
  totalApplications: number;
  candidates: Array<{
    requestId: string;
    acceptedAt: string;
    candidate: CandidateSnapshot;
    applications: any[]; // You can strongly type this based on your app structure later
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Generic pagination interface since your API reuses this
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface MentorUnit {
  userId: string;
  name: string;
  type: string | null;
  industry: string | null;
  location: string | null;
  avatarUrl: string | null;
  description: string | null;
  isAurovillian: boolean | null;
  applicationCount: number;
}

// Add to your types/mentor.types.ts

export interface MentorAcceptedCandidate {
  requestId: string;
  message: string | null;
  requestedAt: string;
  acceptedAt: string;
  candidate: {
    userId: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    profileSummary: string | null;
    skills: string[] | null;
    experienceLevel: string | null;
  };
}

// types/mentor.types.ts

export interface MentorHiredCandidate {
  applicationId: string;
  status: string; // Expected to be "hired"
  candidate: {
    userId: string;
    name: string;
    avatarUrl: string | null;
  };
  internship: {
    title: string;
    duration?: string; // e.g., "6 Months"
    type?: string;     // e.g., "Part time"
  };
  unit: {
    name: string;
    logoUrl?: string | null;
  };
  // Progress might not be in the immediate backend yet, but we define it for the UI
  projectsProgress?: number; 
}

export interface StatTile {
  total: number;
  newThisMonth: number;
}

export interface MentorStats {
  acceptedMentees: StatTile;
  menteeUnitCount: StatTile;
  upcomingMeetings: StatTile;
  hiredApplications: StatTile;
  pendingRequests: StatTile;
}

/** Shape of the full API response from GET /mentor/stats */
export interface MentorStatsApiResponse {
  status_code: number;
  message: string;
  data: MentorStats;
}




// export type MentorUnitsResponse = PaginatedResponse<MentorUnit>;
// We don't need to type the full object right now if we only want the counts, 
// but it's good practice to set up the shells.
export type MentorAcceptedCandidatesResponse = PaginatedResponse<MentorAcceptedCandidate>;
export type MentorUnitsResponse = PaginatedResponse<MentorUnit>; 
export type MentorMeetingsResponse = PaginatedResponse<any>;
export type MentorHiredCandidatesResponse = PaginatedResponse<MentorHiredCandidate>;