export interface InternshipApplicant {
  createdAt: string;
  applicationId: string;
  candidateName: string;
  candidateAvatarUrl: string | null;
  internshipTitle: string;
  status:
    | "applied"
    | "shortlisted"
    | "not_shortlisted"
    | "interviewed"
    | "hired";
  candidateSkills: string[];
  candidateInterests: string[];

  // --- MISSING FIELDS (Request from Backend Team) ---
  appliedDate?: string; // Needed for "Applied X days ago"
  profileSummary?: string; // Needed for the candidate bio text
}

export interface Applicant {
  applicationId: string;
  candidateName: string;
  candidateAvatarUrl?: string;
  internshipTitle: string;
  status: string;
  appliedDate?: string; // ISO String
  profileSummary?: string;
  candidateSkills?: string[];
  matchScore?: number; // CamelCase
  match_score?: number; // Snake_case fallback
}
