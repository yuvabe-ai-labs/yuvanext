export enum TaskStatus {
  PENDING = "pending",
  SUBMITTED = "submitted",
  REDO = "redo",
  ACCEPTED = "accepted",
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
  taskTitle?: string;
  taskDescription?: string | null;
  taskStartDate?: string | null;
  taskEndDate?: string | null;
  taskStartTime?: string | null;
  taskEndTime?: string | null;
  taskColor?: string | null;
  taskStatus?: TaskStatus;
  taskSubmissionLink?: string | null;
}

export interface Task {
  taskId: string;
  taskStatus: TaskStatus;
  taskTitle: string;
  taskDescription: string | null;
  taskCreatedAt: string | null;
  taskStartDate: string | null;
  taskEndDate: string | null;
  taskStartTime: string | null;
  taskEndTime: string | null;
  taskColor: string | null;
  taskSubmissionLink: string | null;
}

export interface ApplicationTasks {
  applicationId: string;
  applicantId: string;
  applicantName: string | null;
  applicantEmail: string | null;
  candidateAvatarUrl: string | null;
  candidatePhoneNumber: string | null;
  internshipId: string;
  internshipName: string | null;
  internshipCreatedAt: string;
  internshipClosingDate: string | null;
  tasks: Task[];
}
