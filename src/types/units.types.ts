import type {
  JobType,
  InternshipStatus,
  Internship,
} from "@/types/internships.types";

export interface Unit {
  userId: string;

  name: string | null;
  type: string | null;
  phone: string | null;
  address: string | null;
  websiteUrl: string | null;

  mission: string | null;
  values: string | null;
  description: string | null;
  industry: string | null;

  isAurovillian: boolean | null;

  bannerUrl: string | null;
  avatarUrl: string | null;

  galleryImages: string[];
  galleryVideos: string[];

  focusAreas: string[];
  skillsOffered: string[];

  location: string | null;

  opportunitiesOffered: unknown[];
  projects: unknown[];

  socialLinks: Record<string, string> | null;

  email: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface UnitById {
  userId: string;

  name: string | null;
  type: string | null;
  phone: string | null;
  address: string | null;
  websiteUrl: string | null;

  mission: string | null;
  values: string | null;
  description: string | null;
  industry: string | null;

  isAurovillian: boolean | null;

  bannerUrl: string | null;
  avatarUrl: string | null;

  galleryImages: string[];
  galleryVideos: string[];

  focusAreas: string[];
  skillsOffered: string[];

  location: string | null;

  opportunitiesOffered: unknown[];
  projects: unknown[];

  socialLinks: Record<string, string> | null;

  email: string | null;

  internships: Internship[];

  createdAt: string;
  updatedAt: string;
}
