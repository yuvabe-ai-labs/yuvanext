import { useQuery } from "@tanstack/react-query";
import { 
  getMentorDashboardStats, 
  getMentorUnits, 
  getMentorMeetings 
} from "@/services/mentor.service";

export const useAdminStatsOverview = () => {
  const dashboardQuery = useQuery({
    queryKey: ["mentor-dashboard-stats"],
    queryFn: getMentorDashboardStats,
  });

  const unitsQuery = useQuery({
    queryKey: ["mentor-units-stats"],
    queryFn: getMentorUnits,
  });

  const meetingsQuery = useQuery({
    queryKey: ["mentor-meetings-stats"],
    queryFn: getMentorMeetings,
  });

  // Combine loading states so the skeletons show until EVERYTHING is ready
  const isLoading = 
    dashboardQuery.isLoading || 
    unitsQuery.isLoading || 
    meetingsQuery.isLoading;

  return {
    dashboard: dashboardQuery.data,
    units: unitsQuery.data,
    meetings: meetingsQuery.data,
    isLoading,
  };
};