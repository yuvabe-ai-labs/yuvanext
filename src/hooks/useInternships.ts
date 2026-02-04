import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInternships,
  getInternshipById,
  getRemommendedInternships,
  getSavedInternships,
  getAppliedInternships,
  getSaveAndAppliedCount,
  saveInternship,
  removeSavedInternship,
  getInternshipShareLink,
  getAppliedInternshipStatus,
  updateCandidateDecision,
  applyToInternship,
  updateInternship,
  createInternship,
  deleteInternship,
} from "@/services/internships.service";
import {
  ApplyInternshipRequest,
  CandidateDecision,
  UpdateInternshipPayload,
  CreateInternshipPayload,
} from "@/types/internships.types";
import { useToast } from "./use-toast";

export const useInternship = () => {
  return useQuery({
    queryKey: ["internships"],
    queryFn: getInternships,
  });
};

export const useInternshipById = (id: string) => {
  return useQuery({
    queryKey: ["internship", id],
    queryFn: () => getInternshipById(id),
    enabled: !!id,
  });
};

export const useRemommendedInternships = () => {
  return useQuery({
    queryKey: ["recommendedInternships"],
    queryFn: getRemommendedInternships,
  });
};

export const useSavedInternships = () => {
  return useQuery({
    queryKey: ["savedInternships"],
    queryFn: getSavedInternships,
  });
};

export const useAppliedInternships = () => {
  return useQuery({
    queryKey: ["appliedInternships"],
    queryFn: getAppliedInternships,
  });
};

export const useSaveAndAppliedCount = () => {
  return useQuery({
    queryKey: ["savedAndAppliedInternships"],
    queryFn: getSaveAndAppliedCount,
  });
};

export const useSaveInternship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (internshipId: string) => saveInternship(internshipId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedInternships"] });
      queryClient.invalidateQueries({
        queryKey: ["savedAndAppliedInternships"],
      });
    },
  });
};

export const useRemoveSavedInternship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (internshipId: string) => removeSavedInternship(internshipId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedInternships"] });
      queryClient.invalidateQueries({
        queryKey: ["savedAndAppliedInternships"],
      });
    },
  });
};

export const useInternshipShareLink = () => {
  return useMutation({
    mutationFn: (internshipId: string) => getInternshipShareLink(internshipId),
  });
};

export const useAppliedInternshipStatus = () => {
  return useQuery({
    queryKey: ["appliedInternshipStatus"],
    queryFn: getAppliedInternshipStatus,
  });
};

export const useUpdateCandidateDecision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      decision,
    }: {
      applicationId: string;
      decision: CandidateDecision;
    }) => updateCandidateDecision(applicationId, decision),

    onSuccess: () => {
      // refresh application-related data
      queryClient.invalidateQueries({
        queryKey: ["appliedInternships"],
      });
      queryClient.invalidateQueries({
        queryKey: ["appliedInternshipStatus"],
      });
    },
  });
};

export const useApplyToInternship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      internshipId,
      data,
    }: {
      internshipId: string;
      data: ApplyInternshipRequest;
    }) => applyToInternship(internshipId, data),

    onSuccess: () => {
      // Invalidate and refetch applied internships data
      queryClient.invalidateQueries({ queryKey: ["appliedInternships"] });
      queryClient.invalidateQueries({
        queryKey: ["savedAndAppliedInternships"],
      });
      queryClient.invalidateQueries({
        queryKey: ["appliedInternshipStatus"],
      });
    },
  });
};

export const useCreateInternship = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateInternshipPayload) => createInternship(payload),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Internship posted successfully!",
      });
      // Invalidate the list so the new internship appears immediately
      queryClient.invalidateQueries({ queryKey: ["internships"] });
      // Also invalidate stats if you have a dashboard query
      queryClient.invalidateQueries({ queryKey: ["unitStats"] });
    },
    onError: (error) => {
      console.error("Create internship failed", error);
    },
  });
};

export const useUpdateInternship = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: UpdateInternshipPayload) => updateInternship(payload),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Internship updated successfully!",
      });

      queryClient.invalidateQueries({ queryKey: ["internships"] });
    },
    onError: (error) => {
      console.error("Update internship failed", error);
    },
  });
};

export const useDeleteInternship = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteInternship(id),

    onSuccess: () => {
      toast({
        title: "Deleted",
        description: "Job description removed successfully",
      });
      // Forces the "internships" query to refetch, updating the UI list automatically
      queryClient.invalidateQueries({ queryKey: ["internships"] });
      // Also update stats if they track total jobs
      queryClient.invalidateQueries({ queryKey: ["unitStats"] });
    },

    onError: (error) => {
      console.error("Delete internship failed", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete internship",
        variant: "destructive",
      });
    },
  });
};
