export enum InternshipStatus {
  CLOSED = "closed",
  ACTIVE = "active",
}

export enum CandidateDecision {
  ACCEPT = "accept",
  REJECT = "reject",
  PENDING = "pending",
}

export enum UnitDecision {
  SELECT = "select",
  REJECT = "reject",
  PENDING = "pending",
}

export enum UnitDecision {
  A = "full_time",
  PART_TIME = "part_time",
  BOTH = "both",
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

export interface ApiMessageResponse {
  message: string;
}

export interface ApplyInternshipRequest {
  includedSections: string[];
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
  internshipTitle: string;
  internshipDescription: string;
  createdBy: CreatedBy;
}

export interface AppliedInternships {
  id: string;
  internshipId: string;
  status: InternshipApplicationStatus;
  includedSections: string[];
  createdAt: string;
  internshipTitle: string;
  internshipDescription: string;
  createdBy: CreatedBy;
}

export interface SavedAndAppliedCount {
  savedCount: number;
  appliedCount: number;
}

export interface AppliedInternshipStatus {
  id: string;
  applicationTitle: string;
  status: InternshipApplicationStatus;
  candidateOfferDecision: CandidateDecision | null;
  unitOfferDecision: UnitDecision | null;
  unitName: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}
