import { useQuery } from "@tanstack/react-query";
import { getInternshipApplicants } from "@/services/applicant.service";

export const useInternshipApplicants = (internshipId: string | undefined) => {
  return useQuery({
    queryKey: ["internshipApplicants", internshipId],
    queryFn: () => getInternshipApplicants(internshipId || ""),
    enabled: !!internshipId,
  });
};
