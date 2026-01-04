import { useQuery } from "@tanstack/react-query";
import { getUnitApplications, getUnitStats } from "@/services/unit.service";

export const useUnitStats = () => {
  return useQuery({
    queryKey: ["unitStats"],
    queryFn: getUnitStats,
    select: (data) => ({
      total: data.totalApplications,
      totalJobs: data.totalInternships,
      interviews: data.totalInterviews,
      hiredThisMonth: data.hiredThisMonth,
    }),
  });
};

export const useUnitApplications = () => {
  return useQuery({
    queryKey: ["unitApplications"],
    queryFn: getUnitApplications,
  });
};
