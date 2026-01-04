import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/config/platform-api";

// Fetch tasks for a specific application
export const useStudentTasks = (applicationId: string | undefined) => {
  return useQuery({
    queryKey: ["studentTasks", applicationId],
    queryFn: async () => {
      if (!applicationId) throw new Error("No application ID");

      // Assumption: GET /api/tasks?application_id=...
      // Or: GET /api/tasks/application/{id}
      const { data } = await axiosInstance.get(`/tasks`, {
        params: { application_id: applicationId },
      });
      return data;
    },
    enabled: !!applicationId,
  });
};

// Create a new task
export const useCreateStudentTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      taskData,
    }: {
      studentId: string;
      taskData: any;
    }) => {
      // POST /api/tasks
      const { data } = await axiosInstance.post("/tasks", {
        ...taskData,
        student_id: studentId,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["studentTasks", variables.taskData.application_id],
      });
    },
  });
};

// Delete a task
export const useDeleteStudentTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      // DELETE /api/tasks/{id}
      await axiosInstance.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentTasks"] });
    },
  });
};

// Update a task
export const useUpdateStudentTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: any;
    }) => {
      // PUT /api/tasks/{id}
      const { data } = await axiosInstance.put(`/tasks/${taskId}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentTasks"] });
    },
  });
};
