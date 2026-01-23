import { Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCandidateTasks } from "@/hooks/useCandidateTasks";
import { calculateOverallTaskProgress } from "@/utils/taskProgress";
import { useMemo, useEffect } from "react";

interface CandidateInfoCardProps {
  applicationId: string;
}

export default function CandidateInfoCard({
  applicationId,
}: CandidateInfoCardProps) {
  const { data, isLoading, error } = useCandidateTasks(applicationId);

  // Debug logging
  useEffect(() => {
    if (data?.tasks) {
      console.log("=== DEBUG: Tasks Data ===");
      console.log("Total tasks:", data.tasks.length);
      console.log(
        "Tasks:",
        data.tasks.map((t) => ({
          title: t.taskTitle,
          status: t.taskStatus,
        })),
      );
    }
  }, [data?.tasks]);

  // Calculate task progress
  const taskProgress = useMemo(() => {
    if (!data || !data.tasks || data.tasks.length === 0) {
      console.log("No tasks available");
      return 0;
    }

    const progress = calculateOverallTaskProgress(data.tasks);
    console.log("Calculated progress:", progress + "%");
    return progress;
  }, [data?.tasks]);

  // Memoize circle calculations
  const circleMetrics = useMemo(() => {
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference * (1 - taskProgress / 100);
    console.log("Circle metrics:", {
      progress: taskProgress,
      circumference,
      offset: progressOffset,
    });
    return { circumference, progressOffset };
  }, [taskProgress]);

  if (isLoading) {
    return (
      <Card className="w-full p-6">
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="w-full p-6">
        <p className="text-red-500 text-center">
          Failed to load candidate information
        </p>
      </Card>
    );
  }

  const candidate = {
    name: data.applicantName,
    email: data.applicantEmail,
    phone: data.candidatePhoneNumber,
    avatarUrl: data.candidateAvatarUrl,
  };

  const internship = {
    title: data.internshipName,
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="w-full p-10 bg-white shadow-sm border border-gray-200 rounded-3xl">
      <div className="flex items-center gap-6">
        {/* Profile Avatar */}
        <div className="relative">
          <Avatar className="w-20 h-20">
            <AvatarImage
              src={candidate.avatarUrl || undefined}
              alt={candidate.name || "User"}
            />
            <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-white text-xl font-semibold">
              {getInitials(candidate.name || "NA")}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Candidate Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {candidate.name || "N/A"}
          </h2>
          <p className="text-gray-600 font-medium mb-3">
            {internship.title || "N/A"}
          </p>

          {/* Contact Details */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{candidate.email || "N/A"}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{candidate.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Task Progress Circle */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative w-28 h-28">
            <svg className="transform -rotate-90 w-28 h-28">
              {/* Background circle */}
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="#E6E8EC"
                strokeWidth="10"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="#00C271"
                strokeWidth="10"
                fill="none"
                strokeDasharray={circleMetrics.circumference}
                strokeDashoffset={circleMetrics.progressOffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight">
              <span className="text-base font-semibold text-gray-500">
                {taskProgress}%
              </span>
              <span className="text-[9px] font-medium text-gray-500 mt-0.5">
                Projects Progress
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
