import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getNextPageParam } from "@/lib/infinite-query";
import { getAcceptedCandidates, getAcceptedCandidatesApplications, getAcceptedCandidatesApplicationsList, getMentorHiredCandidates } from "@/services/mentor.service";

export const useMenteesApplications = () => {
  return useQuery({
    queryKey: ["mentees-applications"],
    queryFn: () => getAcceptedCandidatesApplications(15), // Fetch 15 items for the horizontal scroll
  });
};


export const useAcceptedCandidatesList = (page: number, limit: number, search: string) => {
  return useQuery({
    queryKey: ["mentor-accepted-candidates-list", page, limit, search],
    queryFn: () => getAcceptedCandidates({ page, limit, search }),
    placeholderData: (previousData) => previousData, 
  });
};

/** Infinite-scroll variant of useAcceptedCandidatesList. */
export const useInfiniteAcceptedCandidates = (limit: number, search: string) => {
  return useInfiniteQuery({
    queryKey: ["mentor-accepted-candidates-list", "infinite", limit, search],
    queryFn: ({ pageParam }) =>
      getAcceptedCandidates({ page: pageParam, limit, search }),
    initialPageParam: 1,
    getNextPageParam,
  });
};

export const useMenteesApplicationsList = (
  page: number, 
  limit: number, 
  search: string
) => {
  return useQuery({
    queryKey: ["mentees-applications-list", page, limit, search],
    queryFn: () => getAcceptedCandidatesApplicationsList({ page, limit, search }),
    placeholderData: (previousData) => previousData, 
  });
};


export const useMentorHiredCandidatesList = (
  page: number, 
  limit: number, 
  search: string = ""
) => {
  return useQuery({
    queryKey: ["mentor-hired-candidates-list", page, limit, search],
    queryFn: () => getMentorHiredCandidates({ page, limit, search }),
    placeholderData: (previousData) => previousData, 
  });
};