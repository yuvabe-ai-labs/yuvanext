import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getIncomingRequests, 
  respondToMentorshipRequest,  
} from "@/services/mentorship.service";
import { getAvailableMentors, sendMentorshipRequest } from "@/services/candidates.services";

// Mentor Hooks
export const useIncomingRequests = (page: number, limit: number, status = "pending", search = "") => {
  return useQuery({
    queryKey: ["incoming-mentorship-requests", page, limit, status, search],
    queryFn: () => getIncomingRequests({ page, limit, status, search }),
    placeholderData: (prev) => prev,
  });
};

export const useRespondToRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: respondToMentorshipRequest,
    onSuccess: () => {
      // Refresh the requests list and mentor stats after an accept/reject
      queryClient.invalidateQueries({ queryKey: ["incoming-mentorship-requests"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// Candidate Hooks
export const useAvailableMentors = (page: number, limit: number, search = "") => {
  return useQuery({
    queryKey: ["available-mentors", page, limit, search],
    queryFn: () => getAvailableMentors({ page, limit, search }),
    placeholderData: (prev) => prev,
  });
};

export const useSendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMentorshipRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-own-requests"] });
    },
  });
};