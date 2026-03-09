import { getPendingMeetings } from "@/services/settings.service";
import { useQuery } from "@tanstack/react-query";

export const usePendingMeetings = () => {
  return useQuery({
    queryKey: ["pending-meetings"],
    queryFn: getPendingMeetings,
  });
};