// components/StatsGrid.tsx
import React, { useMemo } from "react";
import {
  DoubleUser,
  FoldedFile,
  Handbag,
  Book,
} from "@/components/ui/custom-icons";
import { useNavigate } from "react-router-dom";
import { useAdminStatsOverview } from "@/hooks/useMentorStats";

interface StatCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: number | string;
  subtext: string;
  bgColor: string;
  isLoading?: boolean;
  onClick?: () => void;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
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

      <p className="text-xs text-green-600 font-medium mt-2">
        {isLoading ? "Loading..." : subtext}
      </p>
    </div>
  );
};

export default function StatsGrid() {
  const navigate = useNavigate();
  
  // 1. Fetch data from your new hook
  const { dashboard, units, meetings, isLoading } = useAdminStatsOverview();
  console.log("Dashboard response:", dashboard);
  console.log("Units response:", units);
  console.log("Meetings response:", meetings);

  // 2. Map API data to the cards
  const stats = useMemo(() => {
    return [
      {
        icon: DoubleUser,
        label: "Total Mentees",
        value: dashboard?.totalAcceptedCandidates || 0,
        subtext: "Current active mentees",
        bgColor: "bg-orange-50",
        isLoading,
        onClick: () => navigate("/mentees-management"),
      },
      {
        icon: FoldedFile,
        label: "Mentees Units",
        // Extracting from pagination
        value: units?.pagination?.totalItems || 0,
        subtext: "Units you are interacting with",
        bgColor: "bg-blue-50",
        isLoading,
        onClick: () => navigate("/units-management"),
      },
      {
        icon: Handbag,
        label: "Meetings",
        // Extracting from pagination
        value: meetings?.pagination?.totalItems || 0,
       
        subtext: "Total scheduled meetings",
        bgColor: "bg-yellow-50",
        isLoading,
        onClick: () => navigate("/internships"), // You might want to change this route to /meetings
      },
      {
        icon: Book,
        label: "Applications",
        value: dashboard?.totalApplications || 0,
        subtext: "Total mentee applications",
        bgColor: "bg-indigo-50",
        isLoading,
        onClick: () => navigate("/courses"), // You might want to change this route
      },
    ];
  }, [navigate, dashboard, units, meetings, isLoading]);

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}