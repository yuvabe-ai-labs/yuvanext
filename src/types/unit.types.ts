export interface UnitDashboardStats {
  totalApplications: number;
  totalInternships: number;
  totalInterviews: number;
  hiredThisMonth: number;
  // Backend returns this nested, but we might flatten it in the service/hook
  period?: {
    month: string;
    year: number;
  };
}

export interface UnitApplication {
  application: {
    id: string;
    status:
      | "applied"
      | "pending"
      | "reviewing"
      | "interviewed"
      | "hired"
      | "rejected";
    profileScore: number | null;
    candidateOfferDecision: string;
    createdAt: string;
    updatedAt: string;
  };
  internship: {
    id: string;
    title: string;
    type: string | null;
    duration: string | null;
  };
  candidate: {
    userId: string;
    name: string;
    email: string;
    image: string | null;
    avatarUrl: string | null;
    type: string | null;
    location: string | null;
    phone: string | null;
    skills: string[];
    experienceLevel: string | null;
    profileSummary: string | null;
    interests: string[];
    education: any[];
    course: any[];
    socialLinks: any | null;
    internship: any[];
    projects: any[];
  };
}

// Chart Data Types
export interface WeeklyData {
  day: string;
  previousWeek: number;
  thisWeek: number;
}

export interface MonthlyData {
  month: string;
  applications: number;
}

export interface ReportStats {
  totalApplications: number;
  hiredCandidates: number;
  interviewRate: number;
  averageMatchScore: number;
  totalInternships: number;
  activeInternships: number;
}
