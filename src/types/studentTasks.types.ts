export type TaskStatus = "pending" | "accepted" | "redo" | "submitted";

export interface StudentTask {
  id: string;
  application_id: string;
  student_id: string;
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  color: string;
  submission_link: string;
  status: TaskStatus;
  submitted_at: string;
  reviewed_by: string;
  review_remarks: string;
  reviewed_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  application_id: string;
  title: string;
  description?: string;
  start_date?: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  color?: string;
  submission_link?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  start_date?: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  color?: string;
  submission_link?: string;
  status?: TaskStatus;
  review_remarks?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface StudentTasksResponse {
  data: StudentTask[];
  error: any;
}

export interface StudentTaskDTO {
  taskId: string;
  taskStatus: "pending" | "accepted" | "submitted" | "redo";
  taskTitle: string;
  taskDescription: string | null;
  taskStartDate: string | null;
  taskEndDate: string | null;
  taskStartTime: string | null;
  taskEndTime: string | null;
  taskSubmissionLink: string | null;
  taskSubmittedAt: string | null;
  taskReviewRemarks: string | null;
  taskReviewedAt: string | null;
  applicationId: string;
  applicantId: string;
  applicantName: string | null;
  applicantEmail: string | null;
  internshipName: string | null;
  internshipStartDate: string | null;
  internshipEndDate: string | null;
  candidateAvatarUrl: string | null;
  candidatePhoneNumber: string | null;
}

export interface CandidateTasksData {
  tasks: StudentTask[];
  candidate: {
    name: string;
    email: string;
    phone: string;
    avatarUrl: string | null;
  };
  internship: {
    title: string;
  };
}
