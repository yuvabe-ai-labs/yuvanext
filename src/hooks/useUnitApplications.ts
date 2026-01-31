import { useQuery } from "@tanstack/react-query";
import { getUnitApplications, getUnitStats } from "@/services/unit.service";

export const useUnitStats = () => {
  return useQuery({
    queryKey: ["unitStats"],
    queryFn: getUnitStats,
    select: (data) => ({
      totalApplications: data.totalApplications,
      totalInternships: data.totalInternships,
      totalInterviews: data.totalInterviews,
      hiredThisMonth: data.hiredThisMonth,
      totalActiveInternships: data.totalActiveInternships,
      totalHired: data.totalHired,
    }),
  });
};

export const useUnitApplications = () => {
  return useQuery({
    queryKey: ["unitApplications"],
    queryFn: getUnitApplications,
  });
};
