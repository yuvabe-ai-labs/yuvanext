import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStudentTasks,
  createStudentTask,
  deleteStudentTask,
  updateStudentTask,
} from "@/services/studentTasks.service";
import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "@/types/studentTasks.types";

export const useStudentTasks = (applicationId: string | undefined) => {
  return useQuery({
    queryKey: ["studentTasks", applicationId],
    queryFn: () => {
      if (!applicationId)
        return Promise.resolve({ data: [], error: "No application ID" });
      return getStudentTasks(applicationId);
    },
    enabled: !!applicationId,
  });
};

export const useCreateStudentTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      taskData,
    }: {
      studentId: string;
      taskData: CreateTaskInput;
    }) => createStudentTask(studentId, taskData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["studentTasks", variables.taskData.application_id],
      });
    },
  });
};

export const useDeleteStudentTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteStudentTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentTasks"] });
    },
  });
};

export const useUpdateStudentTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: UpdateTaskInput;
    }) => updateStudentTask(taskId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["studentTasks"],
      });
    },
  });
};
