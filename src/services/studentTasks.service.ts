import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type {
  StudentTaskDTO,
  CandidateTasksData,
  StudentTask,
} from "@/types/studentTasks.types";

export const getStudentTasksByApplication = async (
  applicationId: string
): Promise<StudentTaskDTO> => {
  try {
    const response = await axiosInstance.get(
      `/tasks/application/${applicationId}`
    );

    // Directly return the raw data structure from the API
    return await handleApiResponse<StudentTaskDTO>(
      response,
      {} as StudentTaskDTO
    );
  } catch (error) {
    return handleApiError(error);
  }
};
