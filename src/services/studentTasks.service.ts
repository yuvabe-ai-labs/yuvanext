import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type {
  StudentTaskDTO,
  CandidateTasksData,
  StudentTask,
} from "@/types/studentTasks.types";

export const getStudentTasksByApplication = async (
  applicationId: string
): Promise<CandidateTasksData> => {
  try {
    const response = await axiosInstance.get(
      `/tasks/application/${applicationId}`
    );

    const rawData = await handleApiResponse<StudentTaskDTO>(
      response,
      {} as StudentTaskDTO
    );

    // Safety check: ensure rawData and tasks exist
    if (!rawData || !rawData.tasks) {
      throw new Error("Invalid response structure");
    }

    const tasks: StudentTask[] = rawData.tasks.map((item) => ({
      id: item.taskId,
      application_id: rawData.applicationId,
      student_id: rawData.applicantId,
      title: item.taskTitle,
      description: item.taskDescription || "",
      start_date: item.taskStartDate || new Date().toISOString(),
      start_time: item.taskStartTime || "09:00",
      end_date: item.taskEndDate || new Date().toISOString(),
      end_time: item.taskEndTime || "17:00",
      color: "#3b82f6",
      submission_link: item.taskSubmissionLink || "",
      status: item.taskStatus,
      submitted_at: item.taskSubmittedAt || "",
      reviewed_by: "",
      review_remarks: item.taskReviewRemarks || "",
      reviewed_at: item.taskReviewedAt || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const candidate = {
      name: rawData.applicantName || "Unknown Candidate",
      email: rawData.applicantEmail || "",
      phone: rawData.candidatePhoneNumber || "",
      avatarUrl: rawData.candidateAvatarUrl || null,
    };

    const internship = {
      title: rawData.internshipName || "Internship",
    };

    return { tasks, candidate, internship };
  } catch (error) {
    return handleApiError(error);
  }
};
