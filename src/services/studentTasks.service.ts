import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type {
  StudentTaskDTO,
  CandidateTasksData,
  StudentTask,
} from "@/types/studentTasks.types";
  CreateTaskInput,
  UpdateTaskInput,
  StudentTasksResponse,
} from "@/types/candidateTasks.types";

export const getStudentTasksByApplication = async (
  applicationId: string
): Promise<CandidateTasksData> => {
  try {
    const response = await axiosInstance.get(
      `/tasks/application/${applicationId}`
    );

    // 1. Use handleApiResponse to unwrap data safely
    const rawData = await handleApiResponse<StudentTaskDTO[]>(response, []);

    // 2. Map API DTO (CamelCase) -> UI Interface (snake_case)
    const tasks: StudentTask[] = rawData.map((item) => ({
      id: item.taskId,
      application_id: item.applicationId,
      student_id: item.applicantId,
      title: item.taskTitle,
      description: item.taskDescription || "",
      start_date: item.taskStartDate || new Date().toISOString(),
      start_time: item.taskStartTime || "09:00",
      end_date: item.taskEndDate || new Date().toISOString(),
      end_time: item.taskEndTime || "17:00",
      color: "#3b82f6", // Default color
      submission_link: item.taskSubmissionLink || "",
      status: item.taskStatus,
      submitted_at: item.taskSubmittedAt || "",
      reviewed_by: "",
      review_remarks: item.taskReviewRemarks || "",
      reviewed_at: item.taskReviewedAt || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // 3. Extract Info (Using Optional Chaining)
    const firstItem = rawData[0];

    const candidate = {
      name: firstItem?.applicantName || "Unknown Candidate",
      email: firstItem?.applicantEmail || "",
      phone: firstItem?.candidatePhoneNumber || "",
      avatarUrl: firstItem?.candidateAvatarUrl || null,
    };

    const internship = {
      title: firstItem?.internshipName || "Internship",
    };

    return { tasks, candidate, internship };
  } catch (error) {
    // 4. Use handleApiError to standardize errors
    return handleApiError(error);
  }
};
