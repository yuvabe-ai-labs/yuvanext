import React, { useMemo } from "react";
import {
  DoubleUser,
  FoldedFile,
  Handbag,
  Book,
} from "@/components/ui/custom-icons";

// import { useAdminStatsOverview } from "@/hooks/useStats";
import { useNavigate } from "react-router-dom";

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
    onClick ? "cursor-pointer" : ""
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
    {subtext}
  </p>
</div>

  );
};
export default function StatsGrid() {
  const navigate = useNavigate();
//   const { data: statsData, isLoading } = useAdminStatsOverview();

const HARD_CODED_STATS = {
  totalMentees: 128,
  newMenteesThisMonth: 12,

  totalUnits: 342,
  newUnitsThisMonth: 28,

  totalMeetings: 46,
  newMeetingsThisMonth: 6,

  totalActivaties: 19,
  newActivitiesThisMonth: 3,
};


  const stats = useMemo(() => {
    return [
      {
        icon: DoubleUser,
        label: "Total Mentees",
        value: HARD_CODED_STATS?.totalMentees || 0,
        subtext: `+${HARD_CODED_STATS?.newMenteesThisMonth || 0} new this month`,
        bgColor: "bg-orange-50",
        // isLoading,
        onClick: () => navigate("/mentees-management"),
      },
      {
        icon: FoldedFile,
        label: "Active Units",
        value: HARD_CODED_STATS?.totalUnits || 0,
        subtext: `+${HARD_CODED_STATS?.newUnitsThisMonth || 0} new this month`,
        bgColor: "bg-blue-50",
        // isLoading,
        onClick: () => navigate("/units-management"),
      },
      {
        icon: Handbag,
        label: "Meetings",
        value: HARD_CODED_STATS?.totalMeetings || 0,
        subtext: `+${HARD_CODED_STATS?.newMenteesThisMonth || 0} new this month`,
        bgColor: "bg-yellow-50",
        // isLoading,
        onClick: () => navigate("/internships"),
      },
      {
        icon: Book,
        label: "Activities",
        value: HARD_CODED_STATS?.totalActivaties || 0,
        subtext: `+${HARD_CODED_STATS?.newActivitiesThisMonth || 0} new this month`,
        bgColor: "bg-indigo-50",
        // isLoading,
        onClick: () => navigate("/courses"),
      },
    ];
  }, [navigate]);

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
