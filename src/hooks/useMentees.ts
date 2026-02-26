import { useQuery } from "@tanstack/react-query";
import { getAcceptedCandidatesApplications } from "@/services/mentor.service";

export const useMenteesApplications = () => {
  return useQuery({
    queryKey: ["mentees-applications"],
    queryFn: () => getAcceptedCandidatesApplications(15), // Fetch 15 items for the horizontal scroll
  });
};