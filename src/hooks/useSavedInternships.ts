import { useQuery } from "@tanstack/react-query";
import {
  getSavedInternships,
  getAppliedInternships,
} from "@/services/internships.service";

/**
 * Hook to check if a specific internship is saved
 */
export const useIsSaved = (internshipId: string) => {
  const {
    data: savedInternships,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["savedInternships"],
    queryFn: getSavedInternships,
    enabled: !!internshipId,
  });

  const isSaved =
    savedInternships?.some((saved) => saved.internshipId === internshipId) ??
    false;

  return {
    isSaved,
    isLoading,
    refetch,
  };
};

/**
 * Hook to check if a specific internship has been applied to
 */
export const useIsApplied = (internshipId: string) => {
  const {
    data: appliedInternships,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["appliedInternships"],
    queryFn: getAppliedInternships,
    enabled: !!internshipId,
  });

  const isApplied =
    appliedInternships?.some(
      (applied) => applied.internshipId === internshipId
    ) ?? false;

  // Get the application details if it exists
  const applicationData = appliedInternships?.find(
    (applied) => applied.internshipId === internshipId
  );

  return {
    isApplied,
    applicationData,
    isLoading,
    refetch,
  };
};

/**
 * Combined hook to check both saved and applied status
 */
export const useInternshipStatus = (internshipId: string) => {
  const savedStatus = useIsSaved(internshipId);
  const appliedStatus = useIsApplied(internshipId);

  return {
    isSaved: savedStatus.isSaved,
    isApplied: appliedStatus.isApplied,
    applicationData: appliedStatus.applicationData,
    isLoading: savedStatus.isLoading || appliedStatus.isLoading,
    refetchSaved: savedStatus.refetch,
    refetchApplied: appliedStatus.refetch,
  };
};
