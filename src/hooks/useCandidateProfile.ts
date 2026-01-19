import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCandidateProfile,
  updateApplicationStatus,
} from "@/services/profile.service";
import { useToast } from "@/hooks/use-toast";
import type { UpdateApplicationStatusPayload } from "@/types/profiles.types";

export const useCandidateProfile = (applicationId: string) => {
  return useQuery({
    queryKey: ["candidateProfile", applicationId],
    queryFn: () => getCandidateProfile(applicationId),
    enabled: !!applicationId,
    retry: 1,
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: UpdateApplicationStatusPayload) =>
      updateApplicationStatus(payload),
    onSuccess: (_, variables) => {
      const isInterview = variables.status === "interviewed";
      toast({
        title: isInterview ? "Interview Scheduled" : "Status Updated",
        description: isInterview
          ? "Interview scheduled and candidate notified."
          : "Application status updated successfully.",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] }); // broad invalidation or specific ID
      queryClient.invalidateQueries({ queryKey: ["unitApplications"] });
    },
    onError: (error) => {
      console.error("Update status failed", error);
    },
  });
};
