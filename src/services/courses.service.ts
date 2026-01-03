import axiosInstance from "@/config/platform-api";
import type { Course } from "@/types/courses.types";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";

// Fetch all courses

export const getCourses = async (): Promise<Course[]> => {
  try {
    const response = await axiosInstance.get("courses");
    return handleApiResponse<Course[]>(response, []);
  } catch (error) {
    return handleApiError(error, "Failed to fetch courses");
  }
};
