import { useQuery } from "@tanstack/react-query";
import type { MentorStats } from "@/types/mentor.types";
import { getMentorStats } from "@/services/mentor.service";

/**
 * Fetches all four dashboard stat tiles in a single request:
 *   acceptedMentees, menteeUnitCount, upcomingMeetings, hiredApplications
 * Each tile has: { total, newThisMonth }
 */
export const useMentorStats = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["mentor-stats"],
    queryFn: getMentorStats,
  });

  const stats: MentorStats | undefined = data?.data;

  return {
    stats,
    isLoading,
    isError,
  };
};