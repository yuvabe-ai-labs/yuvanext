// hooks/useMentorUnits.ts
import { useQuery } from "@tanstack/react-query";
import { getMentorUnits } from "@/services/mentor.service";
import { getMentorUnitCandidates } from "@/services/mentorship.service";

export const useMentorUnitsList = (page: number, limit: number, search: string) => {
  return useQuery({
    // Include page, limit, and search in the key so it refetches when they change!
    queryKey: ["mentor-units-list", page, limit, search],
    queryFn: () => getMentorUnits({ page, limit, search }),
    // Optional: Keeps previous data on screen while fetching the next page
    placeholderData: (previousData) => previousData, 
  });
};

export const useMentorUnitCandidatesList = (
  unitId: string,
  page: number,
  limit: number,
  search: string
) => {
  return useQuery({
    queryKey: ["mentor-unit-candidates", unitId, page, limit, search],
    queryFn: () => getMentorUnitCandidates(unitId, { page, limit, search }),
    enabled: !!unitId, // Only run if unitId is present
    placeholderData: (previousData) => previousData,
  });
};