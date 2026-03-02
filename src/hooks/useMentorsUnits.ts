// hooks/useMentorUnits.ts
import { useQuery } from "@tanstack/react-query";
import { getMentorUnits } from "@/services/mentor.service";

export const useMentorUnitsList = (page: number, limit: number, search: string) => {
  return useQuery({
    // Include page, limit, and search in the key so it refetches when they change!
    queryKey: ["mentor-units-list", page, limit, search],
    queryFn: () => getMentorUnits({ page, limit, search }),
    // Optional: Keeps previous data on screen while fetching the next page
    placeholderData: (previousData) => previousData, 
  });
};