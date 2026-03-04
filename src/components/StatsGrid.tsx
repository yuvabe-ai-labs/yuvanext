// components/StatsGrid.tsx
import React, { useMemo } from "react";
import {
  DoubleUser,
  FoldedFile,
  Handbag,
  Book,
} from "@/components/ui/custom-icons";
import { useNavigate } from "react-router-dom";
import { useMentorStats } from "@/hooks/useMentorStats";
import { UserPlus } from "lucide-react";
import { useIncomingRequests } from "@/hooks/useMentorShip";

interface StatCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | any; // allow lucide icons
  label: string;
  value: number | string;
  newThisMonth: number;
  bgColor: string;
  isLoading?: boolean;
  onClick?: () => void;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  newThisMonth,
  bgColor,
  isLoading,
  onClick,
}: StatCardProps) => {
  return (
    <div
      className={`${bgColor} rounded-2xl p-4 relative ${
        onClick ? "cursor-pointer transition-transform hover:scale-105" : ""
      }`}
      onClick={onClick}
    >
      <Icon className="w-10 h-10 absolute right-4 top-1/2 -translate-y-1/2 opacity-70" />

      <div>
        <p className="text-xs font-medium text-gray-600">{label}</p>

        {isLoading ? (
          <div className="h-9 w-12 bg-gray-200 animate-pulse rounded mt-1" />
        ) : (
          <p className="text-3xl font-bold">{value}</p>
        )}
      </div>

      <p className="text-xs text-green-600 font-medium mt-2">
        {isLoading ? (
          <span className="inline-block h-3 w-24 bg-gray-200 animate-pulse rounded" />
        ) : newThisMonth > 0 ? (
          `+${newThisMonth} new this month`
        ) : (
          "No new additions this month"
        )}
      </p>
    </div>
  );
};

export default function StatsGrid() {
  const navigate = useNavigate();
  const { stats, isLoading: isStatsLoading } = useMentorStats();

  // Fetch the total pending requests
  const { data: requestsData, isLoading: isRequestsLoading } = useIncomingRequests(1, 1, "pending");

  const statCards = useMemo(
    () => [
      {
        icon: UserPlus, 
        label: "Pending Requests",
        value: requestsData?.pagination?.totalItems ?? 0, 
        newThisMonth: 0, 
        bgColor: "bg-purple-50", 
        onClick: () => navigate("/mentorship-respond"),
      },
      {
        icon: DoubleUser,
        label: "Total Mentees",
        value: stats?.acceptedMentees.total ?? 0,
        newThisMonth: stats?.acceptedMentees.newThisMonth ?? 0,
        bgColor: "bg-orange-50",
        onClick: () => navigate("/mentees-management"),
      },
      {
        icon: FoldedFile,
        label: "Mentees Units",
        value: stats?.menteeUnitCount.total ?? 0,
        newThisMonth: stats?.menteeUnitCount.newThisMonth ?? 0,
        bgColor: "bg-blue-50",
        onClick: () => navigate("/units-management"),
      },
      {
        icon: Handbag,
        label: "Upcoming Meetings",
        value: stats?.upcomingMeetings.total ?? 0,
        newThisMonth: stats?.upcomingMeetings.newThisMonth ?? 0,
        bgColor: "bg-yellow-50",
        onClick: () => navigate("/scheduled-meetings"),
      },
      {
        icon: Book,
        label: "Hired Applications",
        value: stats?.hiredApplications.total ?? 0,
        newThisMonth: stats?.hiredApplications.newThisMonth ?? 0,
        bgColor: "bg-indigo-50",
        onClick: () => navigate("/mentees-activities"),
      },
    ],
    [navigate, stats, requestsData] // Make sure requestsData is in the dependency array
  );

  const isLoading = isStatsLoading || isRequestsLoading;

  return (
    // Changed to xl:grid-cols-5 to ensure 5 items fit exactly in one row on large screens
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
      {statCards.map((card) => (
        <StatCard key={card.label} {...card} isLoading={isLoading} />
      ))}
    </div>
  );
}
