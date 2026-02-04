import axiosInstance from "@/config/platform-api";
import type {
  ApplicationTasks,
  CreateTaskPayload,
  Task,
  UpdateTaskPayload,
  InternshipTaskItem,
  ReviewTaskPayload,
} from "@/types/candidateTasks.types";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";

// Get candidate tasks by applicationId
export const getCandidateTasks = async (
  applicationId: string,
): Promise<ApplicationTasks> => {
  try {
    const response = await axiosInstance.get(
      `/tasks/application/${applicationId}`,
    );

    return handleApiResponse<ApplicationTasks>(
      response,
      {} as ApplicationTasks,
    );
  } catch (error) {
    return handleApiError(error, "Failed to fetch candidate tasks");
  }
};

// Create task
export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  try {
    const response = await axiosInstance.post("/tasks", payload);
    return handleApiResponse<Task>(response, {} as Task);
  } catch (error) {
    return handleApiError(error, "Failed to create task");
  }
};

// Update task
export const updateTask = async (
  taskId: string,
  payload: UpdateTaskPayload,
): Promise<Task> => {
  try {
    const response = await axiosInstance.put(`/tasks/${taskId}`, payload);
    return handleApiResponse<Task>(response, {} as Task);
  } catch (error) {
    return handleApiError(error, "Failed to update task");
  }
};

// Delete task
export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.delete(`/tasks/${taskId}`);
    return handleApiResponse<boolean>(response, false);
  } catch (error) {
    return handleApiError(error, "Failed to delete task");
  }
};

export const getAllTaskProgress = async (): Promise<InternshipTaskItem[]> => {
  try {
    const response = await axiosInstance.get("/tasks");

    return handleApiResponse<InternshipTaskItem[]>(
      response,
      [] as InternshipTaskItem[],
    );
  } catch (error) {
    return handleApiError(error, "Failed to fetch tasks");
  }
};

export const reviewTask = async (
  taskId: string,
  payload: ReviewTaskPayload,
): Promise<Task> => {
  try {
    const response = await axiosInstance.post(
      `/tasks/${taskId}/review`,
      payload,
    );

    return handleApiResponse<Task>(response, {} as Task);
  } catch (error) {
    return handleApiError(error, "Failed to review task");
  }
};
