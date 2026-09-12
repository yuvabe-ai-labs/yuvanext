import { useQuery } from "@tanstack/react-query";
import type { MentorStats } from "@/types/mentor.types";
import { getMentorStats, getMenteeGrowth } from "@/services/mentor.service";

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
/**
 * Monthly count of mentees who joined, for the dashboard performance chart.
 * The API returns a dense series (months with no joins come back as 0).
 */
export const useMenteeGrowth = (months: number) => {
  return useQuery({
    queryKey: ["mentor-mentee-growth", months],
    queryFn: () => getMenteeGrowth(months),
    placeholderData: (previousData) => previousData,
  });
};
