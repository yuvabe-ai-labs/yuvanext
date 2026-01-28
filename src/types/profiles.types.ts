// --- Enums ---
export enum UserRole {
  CANDIDATE = "candidate",
  UNIT = "unit",
  ADMIN = "admin",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  PREFER_NOT_SAY = "prefer_not_to_say",
}

export enum MaritalStatus {
  SINGLE = "single",
  MARRIED = "married",
  PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

// --- Shared Sub-Types ---

export interface SocialLink {
  platform: string;
  url: string;
}

export interface Project {
  id?: string;
  projectName: string;
  clientName?: string;
  completionDate?: string;
  description?: string;
  technologies?: string[];
  projectUrl?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
}

export interface Language {
  id?: string;
  name: string;
  read: boolean;
  write: boolean;
  speak: boolean;
}

export interface CandidateInternship {
  id?: string;
  title: string;
  company?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
}

export interface CandidateProject {
  id?: string;
  title?: string;
  name?: string;
  client_name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  technologies?: string[];
  project_url?: string;
}

export interface CandidateCourse {
  id?: string;
  title: string;
  provider?: string;
  completion_date?: string;
  certificate_url?: string;
}

export interface CandidateEducation {
  id?: string;
  is_current: boolean;
  degree?: string;
  name?: string;
  institution?: string;
  school?: string;
  college?: string;
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

export interface Profile {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  image: string | null;
  avatarUrl: string | null;
  phone: string | null;
  location: string | null;
  address: string | null;
  websiteUrl: string | null;
  description: string | null;
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
  type: string | null;
  experienceLevel: string | null;
  profileSummary: string | null;
  maritalStatus: MaritalStatus;
  isDifferentlyAbled: boolean | null;
  hasCareerBreak: boolean | null;
  gender: Gender;
  dateOfBirth: string | null;
  onboardingCompleted: boolean | null;
  skills: string[];
  interests: string[];
  lookingFor: string[];
  language: Language[];
  education: CandidateEducation[];
  course: CandidateCourse[];
  internship: CandidateInternship[];
  projects: CandidateProject[];
  socialLinks: SocialLink[];
  profileScore: number;
  createdAt: string;
  updatedAt: string;
}

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
  gender?: Gender;
  dateOfBirth?: string | null;
  isDifferentlyAbled?: boolean | null;
  hasCareerBreak?: boolean | null;
  onboardingCompleted?: boolean | null;
  mission?: string | null;
  values?: string | null;
  industry?: string | null;
  isAurovillian?: boolean | null;
  bannerUrl?: string | null;
  skills?: string[];
  interests?: string[];
  lookingFor?: string[];
  language?: Language[];
  education?: CandidateEducation[];
  course?: CandidateCourse[];
  internship?: CandidateInternship[];
  projects?: Project[];
  socialLinks?: SocialLink[];
  galleryImages?: string[];
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
    language?: Language[]; // Added for consistency
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

export type ImageType = "avatar" | "banner" | "gallery";

export interface UploadImageResponse {
  url: string;
}

export interface UploadImagePayload {
  file: File;
  type: ImageType;
  userId: string;
}

export interface UploadAvatarResponse {
  avatarUrl: string;
}

export interface DeleteAvatarResponse {
  success: boolean;
  message?: string;
}

export interface UploadAvatarPayload {
  file: File;
}
