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

export interface CreateInternshipPayload {
  title: string;
  duration: string;
  isPaid: boolean; // backend expects isPaid (camelCase)
  payment: string;
  description: string;
  responsibilities: string[];
  benefits: string[];
  skillsRequired: string[]; // backend expects skillsRequired
  language: string[]; // backend expects 'language' string of array
  closingDate: string; // backend expects closingDate
  minAgeRequired: string; // backend expects minAgeRequired
  jobType: "full_time" | "part_time" | "both"; // backend expects jobType
  status: "active";
}

// Optional: Response type if needed
export interface InternshipResponse {
  status_code: number;
  message: string;
  data: object;
}

// This payload is sent to PUT /api/internships/{id}
export interface UpdateInternshipPayload {
  id: string; // The ID of the internship to update
  title: string;
  duration: string;
  isPaid: boolean;
  payment: string;
  description: string;
  responsibilities: string[];
  benefits: string[];
  skillsRequired: string[];
  language: string[];
  closingDate: string;
  minAgeRequired: string;
  jobType: "full_time" | "part_time" | "both";
  // status: "active" | "closed"; // Optional if you update status here too
}
