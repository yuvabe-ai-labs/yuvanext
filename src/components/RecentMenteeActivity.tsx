// components/RecentMenteeActivity.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UnitIcon } from "@/components/ui/custom-icons";
import { useHiredApplicantsList } from "@/hooks/useCandidateTasks";
import { calculateOverallTaskProgress } from "@/utils/taskProgress";
import type { Task } from "@/types/candidateTasks.types";

const MAX_ROWS = 3;

interface ActivityRow {
  applicationId: string;
  name: string;
  avatarUrl: string | null;
  unitName: string;
  progress: number;
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "M";

export default function RecentMenteeActivity() {
  const navigate = useNavigate();
  const { data: applications = [], isLoading } = useHiredApplicantsList();

  const rows: ActivityRow[] = useMemo(() => {
    return (applications ?? []).slice(0, MAX_ROWS).map((application: any) => ({
      applicationId: application.applicationId,
      name: application.applicantName || "Unknown Mentee",
      avatarUrl: application.candidateAvatarUrl ?? null,
      unitName: application.unitName || "Unknown Unit",
      progress: calculateOverallTaskProgress(
        (application.tasks ?? []) as Task[]
      ),
    }));
  }, [applications]);

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">
          Recent Mentee Activity
        </h2>
        <button
          onClick={() => navigate("/mentees-activities")}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          View all
        </button>
      </div>

      <div className="mt-2">
        {isLoading ? (
          <div className="space-y-4 py-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">
            No mentee activity yet.
          </p>
        ) : (
          rows.map((row) => {
            const isComplete = row.progress === 100;

            return (
              <button
                key={row.applicationId}
                onClick={() =>
                  navigate(`/mentor/candidate-tasks/${row.applicationId}`)
                }
                className="flex w-full items-center gap-4 border-b border-gray-100 py-5 text-left last:border-b-0 hover:bg-gray-50/60"
              >
                <Avatar className="h-14 w-14 shrink-0 ring-2 ring-blue-500 ring-offset-2">
                  <AvatarImage
                    src={row.avatarUrl ?? undefined}
                    alt={row.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-200 font-semibold text-gray-700">
                    {initialsOf(row.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold text-gray-900">
                    {row.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <UnitIcon className="shrink-0 text-gray-500" />
                    <span className="truncate text-sm text-gray-500">
                      {row.unitName}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white ${
                        isComplete ? "bg-emerald-500" : "bg-gray-400"
                      }`}
                    >
                      {isComplete ? "Completed" : "In-Progress"}
                    </span>
                  </div>
                </div>

                <div className="w-32 shrink-0 sm:w-40">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Progress</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {row.progress}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${row.progress}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
