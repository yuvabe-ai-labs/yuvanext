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
} from "@/services/internships.service";

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
