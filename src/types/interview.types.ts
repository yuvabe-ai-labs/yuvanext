export type InterviewStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Interview {
  id: string;
  application_id: string;
  scheduled_date: string;
  meeting_link: string;
  title: string;
  description?: string;
  duration_minutes: number;
  unit_id: string;
  student_id: string;
  status: InterviewStatus;
  created_at: string;
  updated_at: string;
  // include nested objects if your API returns them
  application?: any;
  student?: any;
}

export interface CreateInterviewPayload {
  application_id: string;
  scheduled_date: string;
  meeting_link: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  unit_id: string;
  student_id: string;
  status?: InterviewStatus;
}

export interface UpdateInterviewPayload {
  id: string;
  scheduled_date?: string;
  meeting_link?: string;
  title?: string;
  description?: string;
  duration_minutes?: number;
  status?: InterviewStatus;
}
