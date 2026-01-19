import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  deleteTask,
  getCandidateTasks,
  updateTask,
} from "@/services/candidateTasks.service";
import {
  CreateTaskPayload,
  UpdateTaskPayload,
} from "@/types/candidateTasks.types";

export const useCandidateTasks = (applicationId: string) => {
  return useQuery({
    queryKey: ["candidateTasks", applicationId],
    queryFn: () => getCandidateTasks(applicationId),
    enabled: !!applicationId,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["candidateTasks", variables.applicationId],
      });
    },
  });
};

export const useUpdateTask = (applicationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: UpdateTaskPayload;
    }) => updateTask(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidateTasks", applicationId],
      });
    },
  });
};

export const useDeleteTask = (applicationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidateTasks", applicationId],
      });
    },
  });
};
