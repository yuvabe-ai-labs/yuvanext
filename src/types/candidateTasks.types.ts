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
  taskSubmittedAt: string | null;
  taskReviewRemarks: string | null;
  taskReviewedAt: string | null;
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

export interface ITask {
  taskId: string;
  taskStatus: TaskStatus;
}

export interface InternshipTaskItem {
  internshipId: string;
  internshipName: string;
  internshipCreatedAt: string;
  internshipClosingDate: string;
  internshipDuration: string;
  applicationId: string;
  applicantId: string;
  applicantName: string | null;
  unitName: string;
  unitAvatarUrl: string | null;
  tasks: ITask[];
}
