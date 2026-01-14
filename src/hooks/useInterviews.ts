import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
} from "@/services/interview.service";
import { useToast } from "@/hooks/use-toast";
import type {
  CreateInterviewPayload,
  UpdateInterviewPayload,
} from "@/types/interview.types";

// --- Query Hook ---
export const useInterviews = (applicationId?: string) => {
  return useQuery({
    queryKey: ["interviews", applicationId], // Cache key depends on filter
    queryFn: () => getInterviews(applicationId),
    staleTime: 1000 * 60 * 5,
  });
};

// --- Mutation Hooks ---
export const useInterviewMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create
  const createMutation = useMutation({
    mutationFn: (data: CreateInterviewPayload) => createInterview(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Interview scheduled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update (Handles Reschedule, Cancel, Complete)
  const updateMutation = useMutation({
    mutationFn: (data: UpdateInterviewPayload) => updateInterview(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Interview updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInterview(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Interview deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createInterview: createMutation,
    updateInterview: updateMutation,
    deleteInterview: deleteMutation,
  };
};
