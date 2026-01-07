export enum TaskStatus {
  PENDING = "pending",
  SUBMITTED = "submitted",
  REDO = "redo",
  ACCEPTED = "accepted",
}

export interface Task {
  id: string;
  applicationId: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  status: TaskStatus;
  submittedAt: string | null;
  reviewedBy: string | null;
  reviewRemarks: string | null;
  reviewedAt: string | null;
  submissionLink: string | null;
  applicantName: string | null;
  applicantPhone: string | null;
  applicantEmail: string | null;
  internshipTitle: string | null;
  unitName: string | null;
  unitId: string | null;
  color: string | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  applicationId: string;
  title: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  color?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  color?: string | null;
  status?: TaskStatus;
  submissionLink?: string | null;
}
