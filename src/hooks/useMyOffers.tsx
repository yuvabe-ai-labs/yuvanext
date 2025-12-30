import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyOffers, updateOfferDecision } from "@/services/myOffers.service";

export const useMyOffers = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["myOffers", userId],
    queryFn: () => {
      if (!userId) return Promise.resolve({ data: [], error: "No user" });
      return getMyOffers(userId);
    },
    enabled: !!userId,
  });
};

export const useUpdateOfferDecision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      decision,
    }: {
      applicationId: string;
      decision: "accepted" | "rejected";
    }) => updateOfferDecision(applicationId, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myOffers"] });
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
    },
  });
};
