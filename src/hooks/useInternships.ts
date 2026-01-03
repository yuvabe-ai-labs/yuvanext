import { useQuery } from "@tanstack/react-query";
import {
  getInternships,
  getInternshipById,
  getRemommendedInternships,
  getSavedInternships,
  getAppliedInternships,
  getSaveAndAppliedCount,
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
