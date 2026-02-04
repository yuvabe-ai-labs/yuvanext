import { useQuery } from "@tanstack/react-query";
import { getUnitApplications, getUnitStats } from "@/services/unit.service";
import type {
  UnitApplication,
  WeeklyData,
  MonthlyData,
  ReportStats,
} from "@/types/unit.types";

// --- Helpers to Process Chart Data ---

const processWeeklyData = (applications: UnitApplication[]): WeeklyData[] => {
  const days = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
  const weeklyData: WeeklyData[] = [];

  const now = new Date();
  // Calculate start of current week (Monday)
  const currentWeekStart = new Date(now);
  const day = currentWeekStart.getDay() || 7;
  if (day !== 1) currentWeekStart.setHours(-24 * (day - 1));
  currentWeekStart.setHours(0, 0, 0, 0);

  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(currentWeekStart);
    currentDay.setDate(currentWeekStart.getDate() + i);
    const currentDayEnd = new Date(currentDay);
    currentDayEnd.setHours(23, 59, 59, 999);

    const previousDay = new Date(previousWeekStart);
    previousDay.setDate(previousWeekStart.getDate() + i);
    const previousDayEnd = new Date(previousDay);
    previousDayEnd.setHours(23, 59, 59, 999);

    const thisWeekCount = applications.filter((item) => {
      const date = new Date(item.application.createdAt);
      return date >= currentDay && date <= currentDayEnd;
    }).length;

    const prevWeekCount = applications.filter((item) => {
      const date = new Date(item.application.createdAt);
      return date >= previousDay && date <= previousDayEnd;
    }).length;

    weeklyData.push({
      day: days[i],
      previousWeek: prevWeekCount,
      thisWeek: thisWeekCount,
    });
  }
  return weeklyData;
};

const processMonthlyData = (applications: UnitApplication[]): MonthlyData[] => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyData: MonthlyData[] = [];
  const currentYear = new Date().getFullYear();

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthIndex = date.getMonth();
    const monthName = months[monthIndex];

    const count = applications.filter((item) => {
      const appDate = new Date(item.application.createdAt);
      return (
        appDate.getMonth() === monthIndex &&
        appDate.getFullYear() === currentYear
      );
    }).length;

    monthlyData.push({
      month: monthName,
      applications: count,
    });
  }
  return monthlyData;
};

// --- Main Hook ---

export const useUnitReports = () => {
  // 1. Fetch Stats (Parallel)
  const statsQuery = useQuery({
    queryKey: ["unitStats"],
    queryFn: getUnitStats,
  });

  // 2. Fetch Applications (Parallel)
  const appsQuery = useQuery({
    queryKey: ["unitApplications"],
    queryFn: getUnitApplications,
  });

  // 3. Derive Data safely
  const applications = appsQuery.data || [];
  const backendStats = statsQuery.data;

  // Calculate derived stats
  const totalApps = applications.length;
  const hiredCount = applications.filter(
    (a) => a.application.status === "hired"
  ).length;
  const interviewedCount = applications.filter(
    (a) => a.application.status === "interviewed"
  ).length;

  const interviewRate =
    totalApps > 0 ? Math.round((interviewedCount / totalApps) * 100) : 0;

  const appsWithScore = applications.filter(
    (a) => a.application.profileScore !== null
  );
  const avgScore =
    appsWithScore.length > 0
      ? Math.round(
          appsWithScore.reduce(
            (sum, item) => sum + (item.application.profileScore || 0),
            0
          ) / appsWithScore.length
        )
      : 0;

  const stats: ReportStats = {
    totalApplications: backendStats?.totalApplications || totalApps,
    hiredCandidates: hiredCount, // Prefer calculated count to ensure consistency with apps list
    totalInternships: backendStats?.totalInternships || 0,
    activeInternships: 0, // Needs separate internship fetch if you want this accurate
    interviewRate,
    averageMatchScore: avgScore,
  };

  const weeklyData = processWeeklyData(applications);
  const monthlyData = processMonthlyData(applications);

  return {
    weeklyData,
    monthlyData,
    stats,
    loading: statsQuery.isLoading || appsQuery.isLoading,
    error: statsQuery.error || appsQuery.error,
    refetch: () => {
      statsQuery.refetch();
      appsQuery.refetch();
    },
  };
};
