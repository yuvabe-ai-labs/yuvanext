export enum InternshipStatus {
  CLOSED = "closed",
  ACTIVE = "active",
}

export enum JobType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  BOTH = "both",
}

export interface Internship {
  id: string;
  createdBy: string;
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
