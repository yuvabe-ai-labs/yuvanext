import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyOffers, updateOfferDecision } from "@/services/myOffers.service";

export const useMyOffers = () => {
  return useQuery({
    queryKey: ["myOffers"],
    queryFn: getMyOffers,
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
