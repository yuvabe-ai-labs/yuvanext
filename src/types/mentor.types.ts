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

// We don't need to type the full object right now if we only want the counts, 
// but it's good practice to set up the shells.
export type MentorUnitsResponse = PaginatedResponse<any>; 
export type MentorMeetingsResponse = PaginatedResponse<any>;