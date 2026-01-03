export enum InternshipStatus {
  CLOSED = "closed",
  ACTIVE = "active",
}

export enum JobType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  BOTH = "both",
}

export enum InternshipApplicationStatus {
  APPLIED = "applied",
  SHORTLISTED = "shortlisted",
  NOT_SHORTLISTED = "not_shortlisted",
  INTERVIEWED = "interviewed",
  HIRED = "hired",
}

export interface CreatedBy {
  userId: string;
  name: string;
  address: string;
  phone: string;
  websiteUrl: string;
  description: string;
  avatarUrl: string;
  bannerUrl: string;
  location: string;
}

export interface Internship {
  id: string;
  createdBy: CreatedBy;
  title: string;
  description: string | null;
  duration: string | null;
  payment: string | null;
  status: InternshipStatus;
  closingDate: string;
  isPaid: boolean;
  minAgeRequired: string | null;
  jobType: JobType;
  benefits: string[];
  skillsRequired: string[];
  responsibilities: string[];
  language: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedInternships {
  id: string;
  internshipId: string;
  createdAt: string;
  internshipTitle: string | null;
  internshipDescription: string | null;
  internshipCreatedBy: string | null;
}

export interface AppliedInternships {
  id: string;
  internshipId: string;
  status: InternshipApplicationStatus;
  includedSections: string[];
  createdAt: string;
  internshipTitle: string | null;
  internshipDescription: string | null;
  internshipCreatedBy: string | null;
}

export interface SavedAndAppliedCount {
  savedCount: number;
  appliedCount: number;
}
