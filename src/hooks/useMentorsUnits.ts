// hooks/useMentorUnits.ts
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getNextPageParam } from "@/lib/infinite-query";
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

/** Infinite-scroll variant of useMentorUnitCandidatesList. */
export const useInfiniteMentorUnitCandidates = (
  unitId: string,
  limit: number,
  search: string
) => {
  return useInfiniteQuery({
    queryKey: ["mentor-unit-candidates", "infinite", unitId, limit, search],
    queryFn: ({ pageParam }) =>
      getMentorUnitCandidates(unitId, { page: pageParam, limit, search }),
    initialPageParam: 1,
    getNextPageParam,
    enabled: !!unitId,
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