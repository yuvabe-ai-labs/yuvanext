import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  deleteTask,
  getCandidateTasks,
  updateTask,
  getAllTaskProgress,
  reviewTask,
} from "@/services/candidateTasks.service";
import {
  CreateTaskPayload,
  TaskStatus,
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

export const useUpdateTask = () => {
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
        queryKey: ["candidateTasks"],
      });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidateTasks"],
      });
    },
  });
};

export const useAllTaskProgress = () => {
  return useQuery({
    queryKey: ["allTaskProgress"],
    queryFn: getAllTaskProgress,
  });
};

export const useReviewTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: {
        status: TaskStatus.REDO | TaskStatus.ACCEPTED;
        reviewRemarks?: string | null;
      };
    }) => reviewTask(taskId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidateTasks"],
      });
    },
  });
};
