import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAvailableMentors, getCandidateOwnRequests, getMentorById,  sendMentorshipRequest } from "@/services/candidates.services";

export const useAvailableMentorsList = (page: number, limit: number, search: string, mentorType?: string,expertiseArea?: string,
  availabilityDay?: string) => {
  return useQuery({
    queryKey: ["available-mentors", page, limit, search, mentorType, expertiseArea, availabilityDay],
    queryFn: () => getAvailableMentors({ page, limit, search, mentorType, expertiseArea, availabilityDay }),
    placeholderData: (prev) => prev, 
  });
};

export const useSendMentorshipRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMentorshipRequest,
    onSuccess: () => {
      // Refresh any lists showing the candidate's active requests
      queryClient.invalidateQueries({ queryKey: ["candidate-own-requests"] });
    },
  });
};

export const useMentorDetails = (mentorId: string) => {
  return useQuery({
    queryKey: ["mentor-details", mentorId],
    queryFn: () => getMentorById(mentorId),
    enabled: !!mentorId,
  });
};

export const useCandidateOwnRequestsList = (status?: string) => {
  return useQuery({
    queryKey: ["candidate-own-requests", status],
    queryFn: () => getCandidateOwnRequests({ status, limit: 100 }), // Get all active/pending
  });
};