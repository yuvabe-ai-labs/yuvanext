// src/types/profile.types.ts

// --- Enums ---
export enum UserRole {
  CANDIDATE = "candidate",
  UNIT = "unit",
  ADMIN = "admin",
}

// --- Shared Sub-Types ---

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface Project {
  id?: string;
  projectName: string;
  clientName?: string;
  status?: string;
  completionDate?: string;
  description?: string;
  technologies?: string[];
  projectUrl?: string;
}

// --- Candidate Specific Sub-Types ---

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
  name?: string; // Fallback for API inconsistency
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

// --- Main Profile Interface (Unified) ---

export interface Profile {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string; // Keeping as string for compatibility, ideally use UserRole

  // Common Fields
  image: string | null;
  avatarUrl: string | null;
  phone: string | null;
  location: string | null;
  address: string | null;
  websiteUrl: string | null;
  description: string | null;

  // Unit Specific Fields
  mission: string | null;
  values: string | null;
  industry: string | null;
  isAurovillian: boolean | null;
  bannerUrl: string | null;
  galleryVideos: string | null;
  galleryImages: string[];
  focusAreas: string[];
  skillsOffered: string[];
  opportunitiesOffered: string[];

  // Candidate Specific Fields
  type: string | null;
  experienceLevel: string | null;
  profileSummary: string | null;
  maritalStatus: string | null;
  isDifferentlyAbled: boolean | null;
  hasCareerBreak: boolean | null;
  gender: string | null;
  dateOfBirth: string | null;
  onboardingCompleted: boolean | null;

  // Arrays (Typed where possible)
  skills: string[];
  interests: string[];
  lookingFor: string[];
  language: string[];

  // Complex Arrays
  education: CandidateEducation[];
  course: CandidateCourse[];
  internship: CandidateInternship[];
  projects: Project[]; // Unit projects (usually)

  // Social
  socialLinks: SocialLink[];

  // Stats
  profileScore: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// --- API Payload Interfaces ---

export interface UpdateProfilePayload {
  name?: string;
  image?: string | null;
  avatarUrl?: string | null;
  profileSummary?: string | null;
  phone?: string | null;
  location?: string | null;
  address?: string | null;
  websiteUrl?: string | null;
  type?: string | null;
  experienceLevel?: string | null;
  maritalStatus?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  isDifferentlyAbled?: boolean | null;
  hasCareerBreak?: boolean | null;
  onboardingCompleted?: boolean | null;

  // Unit fields
  mission?: string | null;
  values?: string | null;
  industry?: string | null;
  isAurovillian?: boolean | null;
  bannerUrl?: string | null;

  // Arrays
  skills?: string[];
  interests?: string[];
  lookingFor?: string[];
  language?: string[];
  education?: CandidateEducation[];
  course?: CandidateCourse[];
  internship?: CandidateInternship[];
  projects?: Project[];
  socialLinks?: SocialLink[];
  galleryImages?: string[];
}

// --- Application / Candidate View Interfaces ---

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
    education: CandidateEducation[];
    course: CandidateCourse[];
    socialLinks: SocialLink[] | null;
    internship: CandidateInternship[];
    projects: CandidateProject[];
  };
}

export interface InterviewDetails {
  scheduledAt: string;
  meetingLink: string;
  notes?: string;
  durationMinutes: number;
  provider: "zoom" | "google_meet" | "teams" | "other";
}

export interface UpdateApplicationStatusResponse {
  application: {
    id: string;
    status: string;
    updatedAt: string;
  };
  interview?: {
    id: string;
    applicationId: string;
    scheduledDate: string;
    durationMinutes: number;
    link: string | null;
    title: string;
    description: string | null;
    provider: string;
    createdAt: string;
    updatedAt: string;
  };
  notificationSent: boolean;
  candidateEmailSent: boolean;
  unitEmailSent: boolean;
}

export interface UpdateApplicationStatusPayload {
  applicationId: string;
  status:
    | "applied"
    | "shortlisted"
    | "not_shortlisted"
    | "interviewed"
    | "hired";
  interviewDetails?: InterviewDetails;
}

// --- Image Upload Interfaces ---

export type ImageType = "avatar" | "banner" | "gallery";

export interface UploadImageResponse {
  url: string;
}

export interface UploadImagePayload {
  file: File;
  type: ImageType;
  userId: string;
}
