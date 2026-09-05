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
import { useHiredApplicantsList } from "@/hooks/useCandidateTasks";
import { needsAttention } from "@/lib/internship-attention";
import { UserPlus, ChevronRight } from "lucide-react";

interface StatTileProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | any;
  label: string;
  value: number | string;
  newThisMonth: number;
  /** Caption shown when there is nothing new this month */
  emptyCaption: string;
  /** Tailwind text colour for the empty caption */
  emptyTone: string;
  /** Caption rendered at all times, replacing the new/empty pair entirely. */
  staticCaption?: string;
  /** Tailwind text colour for the always-on caption */
  staticTone?: string;
  bgColor: string;
  isLoading?: boolean;
  onClick?: () => void;
}

const StatTile = ({
  icon: Icon,
  label,
  value,
  newThisMonth,
  emptyCaption,
  emptyTone,
  staticCaption,
  staticTone = "text-gray-500",
  bgColor,
  isLoading,
  onClick,
}: StatTileProps) => {
  return (
    <div
      className={`${bgColor} rounded-2xl p-4 sm:p-5 ${
        onClick
          ? "cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          : ""
      }`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-11 h-11 shrink-0" />

        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-600 leading-tight">
            {label}
          </p>

          {isLoading ? (
            <div className="h-8 w-12 bg-white/70 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-3xl font-bold text-gray-900 leading-tight mt-0.5">
              {value}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs font-medium mt-3">
        {isLoading ? (
          <span className="inline-block h-3 w-24 bg-white/70 animate-pulse rounded" />
        ) : staticCaption ? (
          <span className={staticTone}>{staticCaption}</span>
        ) : newThisMonth > 0 ? (
          <span className="text-emerald-600">
            +{newThisMonth} new this month
          </span>
        ) : (
          <span className={emptyTone}>{emptyCaption}</span>
        )}
      </p>
    </div>
  );
};

export default function StatsGrid() {
  const navigate = useNavigate();
  const { stats, isLoading } = useMentorStats();

  const pendingRequests = stats?.pendingRequests.total ?? 0;

  // Mentees in the final month of their internship. Counted from the same
  // list the Activities page renders, so the tile and that page agree.
  const { data: hiredApplicants = [] } = useHiredApplicantsList();
  const attentionCount = useMemo(
    () =>
      hiredApplicants.filter((entry) =>
        needsAttention({
          hiredAt: entry.hiredAt,
          internshipDuration: entry.internshipDuration,
        }),
      ).length,
    [hiredApplicants],
  );

  const statTiles = useMemo(
    () => [
      {
        icon: DoubleUser,
        label: "Total Mentees",
        value: stats?.acceptedMentees.total ?? 0,
        newThisMonth: stats?.acceptedMentees.newThisMonth ?? 0,
        emptyCaption: "No new mentees this month",
        emptyTone: "text-gray-500",
        bgColor: "bg-[#FFF8F1]",
        onClick: () => navigate("/mentees-management"),
      },
      {
        icon: FoldedFile,
        label: "Active Units",
        value: stats?.menteeUnitCount.total ?? 0,
        newThisMonth: stats?.menteeUnitCount.newThisMonth ?? 0,
        emptyCaption: "No new units this month",
        emptyTone: "text-gray-500",
        bgColor: "bg-[#EBF5FF]",
        onClick: () => navigate("/units-management"),
      },
      {
        icon: Handbag,
        label: "Meetings",
        // Total meetings held/scheduled, with this month's count underneath.
        value: stats?.upcomingMeetings.total ?? 0,
        newThisMonth: stats?.upcomingMeetings.newThisMonth ?? 0,
        emptyCaption: "Nothing scheduled this month",
        emptyTone: "text-gray-500",
        bgColor: "bg-[#EEF2FF]",
        onClick: () => navigate("/scheduled-meetings"),
      },
      {
        icon: Book,
        label: "Activities",
        // The number is the count of mentees in their last internship month,
        // and the tile opens the activities list filtered to just those.
        value: attentionCount,
        newThisMonth: attentionCount,
        emptyCaption: "Needs more attention",
        emptyTone: "text-red-500",
        staticCaption: "Needs more attention",
        staticTone: "text-red-500",
        bgColor: "bg-[#FDFDEA]",
        // Always filtered, including when the count is 0 — the list the tile
        // opens must match the number the tile shows.
        onClick: () => navigate("/mentees-activities?filter=attention"),
      },
    ],
    [navigate, stats, attentionCount]
  );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statTiles.map((tile) => (
          <StatTile key={tile.label} {...tile} isLoading={isLoading} />
        ))}
      </div>

      {/* Pending mentorship requests stay reachable from the dashboard, but only
          surface when the mentor actually has something waiting on them. */}
      {!isLoading && pendingRequests > 0 && (
        <button
          onClick={() => navigate("/mentorship-respond")}
          className="mt-4 w-full flex items-center gap-3 rounded-2xl bg-[#F5F3FF] px-4 py-3 text-left transition-shadow hover:shadow-md"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
            <UserPlus className="h-4 w-4 text-violet-600" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-gray-900">
              {pendingRequests} pending mentorship{" "}
              {pendingRequests === 1 ? "request" : "requests"}
            </span>
            <span className="block text-xs text-gray-500">
              Review and respond
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
        </button>
      )}
    </div>
  );
}
