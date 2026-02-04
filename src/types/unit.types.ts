export interface UnitDashboardStats {
  totalApplications: number;
  totalInternships: number;
  totalInterviews: number;
  hiredThisMonth: number;
  totalActiveInternships: number;
  totalHired: number;
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

// Response structure from the new /api/tasks endpoint
export interface HiredCandidateDTO {
  internshipId: string;
  internshipName: string;
  internshipCreatedAt: string;
  internshipClosingDate: string;
  internshipDuration: string;
  internshipJobType: string;
  applicationId: string;
  applicantId: string;
  applicantName: string;
  unitName: string;
  candidateAvatarUrl: string | null;
  tasks: Array<{
    taskId: string;
    taskStatus: string;
  }>;
}

// Normalized structure for your Dashboard UI
export interface HiredCandidate {
  id: string; // application id
  application: {
    id: string;
  };
  internship: {
    id: string;
    title: string;
    duration: string;
    type: string;
  };
  candidate: {
    userId: string;
    name: string;
    avatarUrl: string | null;
  };
  tasks: any[]; // Array of task objects
}
