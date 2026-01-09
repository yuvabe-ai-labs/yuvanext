export interface Profile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  address: string | null;
  websiteUrl: string | null;
  mission: string | null;
  values: string | null;
  description: string | null;
  industry: string | null;
  isAurovillian: boolean | null;
  bannerUrl: string | null;
  galleryVideos: string | null;
  focusAreas: string[];
  skillsOffered: string[];
  opportunitiesOffered: string[];
  role: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  type: string | null;
  experienceLevel: string | null;
  profileSummary: string | null;
  location: string | null;
  maritalStatus: string | null;
  isDifferentlyAbled: boolean | null;
  hasCareerBreak: boolean | null;
  skills: string[];
  interests: string[];
  lookingFor: string[];
  avatarUrl: string | null;
  phone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  onboardingCompleted: boolean | null;
  education: any[];
  language: string[];
  course: any[];
  internship: any[];
  projects: Project[];
  socialLinks: SocialLink[];
  profileScore: number;
  galleryImages: string[];
}

export interface Project {
  id: string;
  projectName: string; // Updated to camelCase if API sends it, check backend!
  clientName?: string;
  status?: string;
  completionDate?: string;
  description?: string;
  technologies?: string[];
  projectUrl?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface CandidateInternship {
  id: string;
  title: string;
  company?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
}

export interface CandidateProject {
  id: string;
  title?: string;
  name?: string; // Fallback
  client_name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  technologies?: string[];
  project_url?: string;
}

export interface CandidateCourse {
  id: string;
  title: string;
  provider?: string;
  completion_date?: string;
  certificate_url?: string;
}

export interface CandidateEducation {
  id: string;
  degree?: string;
  name?: string; // Fallback
  institution?: string;
  school?: string; // Fallback
  college?: string; // Fallback
  field_of_study?: string;
  description?: string;
  start_year?: string;
  start_date?: string;
  end_year?: string;
  end_date?: string;
  score?: string;
  grade?: string;
  gpa?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface CandidateProfileData {
  application: {
    id: string;
    status:
      | "applied"
      | "shortlisted"
      | "not_shortlisted"
      | "interviewed"
      | "hired";
    profileScore: number | null;
    candidateOfferDecision: string | null;
    createdAt: string;
    updatedAt: string;
  };
  internship: {
    // The internship being applied TO
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

    // Arrays for history
    education: CandidateEducation[];
    course: CandidateCourse[];
    socialLinks: SocialLink[] | null;
    internship: CandidateInternship[]; // Candidate's PAST internships
    projects: CandidateProject[];
  };
}

export interface InterviewDetails {
  scheduledAt: string; // ISO Date string
  meetingLink: string; // "zoom" (backend handles generation) OR explicit link
  notes?: string;
  durationMinutes: number;
  provider: "zoom" | "google_meet" | "teams" | "other";
}

export interface UpdateApplicationStatusPayload {
  applicationId: string;
  status:
    | "applied"
    | "shortlisted"
    | "not_shortlisted"
    | "interviewed"
    | "hired";
  interviewDetails?: InterviewDetails; // Optional, required only for 'interviewed' status
}

export type ImageType = "avatar" | "banner";

export interface UploadImageResponse {
  url: string;
  // Add other fields if backend returns them (e.g., key, size)
}

export interface UploadImagePayload {
  file: File;
  type: ImageType;
  userId: string;
}
