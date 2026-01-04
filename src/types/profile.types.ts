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
