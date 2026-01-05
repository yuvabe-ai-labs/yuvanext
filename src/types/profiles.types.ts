export enum UserRole {
  CANDIDATE = "candidate",
}

export interface Profile {
  id: string;
  userId: string;

  name: string;
  email: string;
  image: string | null;
  avatarUrl: string | null;

  role: UserRole;

  phone: string;
  gender: string;
  dateOfBirth: string | null;
  maritalStatus: string | null;

  location: string | null;
  type: string | null;
  experienceLevel: string | null;
  profileSummary: string | null;

  isDifferentlyAbled: boolean | null;
  hasCareerBreak: boolean | null;
  onboardingCompleted: boolean | null;

  skills: string[];
  interests: string[];
  lookingFor: string[];
  language: string[];

  education: unknown[];
  course: unknown[];
  internship: unknown[];
  projects: unknown[];

  socialLinks: Record<string, string> | null;

  profileScore: number;

  createdAt: string;
  updatedAt: string;
}
