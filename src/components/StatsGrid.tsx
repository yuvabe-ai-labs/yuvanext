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

interface StatCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
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
      {/* Icon – top right, vertically centered */}
      <Icon className="w-10 h-10 absolute right-4 top-1/2 -translate-y-1/2" />

      {/* Content */}
      <div>
        <p className="text-xs font-medium text-gray-600">{label}</p>

        {isLoading ? (
          <div className="h-9 w-12 bg-gray-200 animate-pulse rounded mt-1" />
        ) : (
          <p className="text-3xl font-bold">{value}</p>
        )}
      </div>

      {/* "+N new this month" subtext */}
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
  const { stats, isLoading } = useMentorStats();

  const statCards = useMemo(
    () => [
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
        onClick: () => navigate("/meetings"),
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
    [navigate, stats]
  );

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {statCards.map((card) => (
        <StatCard key={card.label} {...card} isLoading={isLoading} />
      ))}
    </div>
  );
}