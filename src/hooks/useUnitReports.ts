// import { useState, useEffect, useCallback } from "react";
// import { authClient } from "@/lib/auth-client";
// import axiosInstance from "@/config/platform-api";

// export interface WeeklyData {
//   day: string;
//   previousWeek: number;
//   thisWeek: number;
// }

// export interface MonthlyData {
//   month: string;
//   applications: number;
// }

// export interface ReportStats {
//   totalApplications: number;
//   hiredCandidates: number;
//   interviewRate: number;
//   averageMatchScore: number;
//   totalInternships: number;
//   activeInternships: number;
// }

// export const useUnitReports = () => {
//   const { data: session } = authClient.useSession();
//   const user = session?.user;

//   const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
//   const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
//   const [stats, setStats] = useState<ReportStats>({
//     totalApplications: 0,
//     hiredCandidates: 0,
//     interviewRate: 0,
//     averageMatchScore: 0,
//     totalInternships: 0,
//     activeInternships: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [selectedMonth, setSelectedMonth] = useState<string>("current");

//   // Helper: Process Weekly Data
//   const processWeeklyData = (applications: any[]): WeeklyData[] => {
//     const days = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
//     const weeklyData: WeeklyData[] = [];

//     const now = new Date();
//     // Start of current week (Monday)
//     const currentWeekStart = new Date(now);
//     const day = currentWeekStart.getDay() || 7;
//     if (day !== 1) currentWeekStart.setHours(-24 * (day - 1));
//     currentWeekStart.setHours(0, 0, 0, 0);

//     const previousWeekStart = new Date(currentWeekStart);
//     previousWeekStart.setDate(previousWeekStart.getDate() - 7);

//     for (let i = 0; i < 7; i++) {
//       const currentDay = new Date(currentWeekStart);
//       currentDay.setDate(currentWeekStart.getDate() + i);
//       const currentDayEnd = new Date(currentDay);
//       currentDayEnd.setHours(23, 59, 59, 999);

//       const previousDay = new Date(previousWeekStart);
//       previousDay.setDate(previousWeekStart.getDate() + i);
//       const previousDayEnd = new Date(previousDay);
//       previousDayEnd.setHours(23, 59, 59, 999);

//       // Check application.createdAt
//       const thisWeekCount = applications.filter((item) => {
//         const date = new Date(item.application.createdAt);
//         return date >= currentDay && date <= currentDayEnd;
//       }).length;

//       const prevWeekCount = applications.filter((item) => {
//         const date = new Date(item.application.createdAt);
//         return date >= previousDay && date <= previousDayEnd;
//       }).length;

//       weeklyData.push({
//         day: days[i],
//         previousWeek: prevWeekCount,
//         thisWeek: thisWeekCount,
//       });
//     }
//     return weeklyData;
//   };

//   // Helper: Process Monthly Data
//   const processMonthlyData = (applications: any[]): MonthlyData[] => {
//     const months = [
//       "Jan",
//       "Feb",
//       "Mar",
//       "Apr",
//       "May",
//       "Jun",
//       "Jul",
//       "Aug",
//       "Sep",
//       "Oct",
//       "Nov",
//       "Dec",
//     ];
//     const monthlyData: MonthlyData[] = [];
//     const currentYear = new Date().getFullYear();

//     for (let i = 5; i >= 0; i--) {
//       const date = new Date();
//       date.setMonth(date.getMonth() - i);
//       const monthIndex = date.getMonth();
//       const monthName = months[monthIndex];

//       const count = applications.filter((item) => {
//         const appDate = new Date(item.application.createdAt);
//         return (
//           appDate.getMonth() === monthIndex &&
//           appDate.getFullYear() === currentYear
//         );
//       }).length;

//       monthlyData.push({
//         month: monthName,
//         applications: count,
//       });
//     }
//     return monthlyData;
//   };

//   const fetchReportsData = useCallback(async () => {
//     if (!user) return;

//     try {
//       setLoading(true);

//       // Parallel Fetch
//       const [statsRes, appsRes] = await Promise.all([
//         axiosInstance.get("/internships/stats"),
//         axiosInstance.get("/unit/applications"),
//       ]);

//       // 1. Process Stats from /internships/stats
//       const backendStats = statsRes.data?.data || {};
//       const allApplications = appsRes.data?.data || [];

//       // Calculate missing stats from the list if needed
//       const hiredCount = allApplications.filter(
//         (item: any) => item.application.status === "hired"
//       ).length;

//       // Calculate Interview Rate
//       const interviewedCount = allApplications.filter(
//         (item: any) => item.application.status === "interviewed"
//       ).length;
//       const totalApps =
//         backendStats.totalApplications || allApplications.length;
//       const interviewRate =
//         totalApps > 0 ? Math.round((interviewedCount / totalApps) * 100) : 0;

//       // Calculate Average Match Score
//       const appsWithScore = allApplications.filter(
//         (item: any) => item.application.profileScore !== null
//       );
//       const avgScore =
//         appsWithScore.length > 0
//           ? Math.round(
//               appsWithScore.reduce(
//                 (sum: number, item: any) =>
//                   sum + (item.application.profileScore || 0),
//                 0
//               ) / appsWithScore.length
//             )
//           : 0;

//       // Combine backend stats + client-side calculations
//       setStats({
//         totalApplications: backendStats.totalApplications || 0,
//         hiredCandidates: hiredCount, // Total hired (vs backend 'hiredThisMonth')
//         totalInternships: backendStats.totalInternships || 0,
//         // Assuming backend doesn't give 'active' count in stats, we might default to 0 or check if internships endpoint needed
//         activeInternships: 0,
//         interviewRate,
//         averageMatchScore: avgScore,
//       });

//       // 2. Process Charts from /unit/applications
//       setWeeklyData(processWeeklyData(allApplications));
//       setMonthlyData(processMonthlyData(allApplications));
//     } catch (error) {
//       console.error("Error fetching reports data:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchReportsData();
//   }, [fetchReportsData]);

//   return {
//     weeklyData,
//     monthlyData,
//     stats,
//     loading,
//     selectedMonth,
//     setSelectedMonth,
//     refetch: fetchReportsData,
//   };
// };
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
