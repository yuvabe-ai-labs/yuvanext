import { Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { useStudentTasks } from "@/hooks/useStudentTasks";
import { calculateOverallTaskProgress } from "@/utils/taskProgress";

interface CandidateInfoCardProps {
  applicationId: string | undefined;
}

export default function CandidateInfoCard({
  applicationId,
}: CandidateInfoCardProps) {
  const { data, loading, error } = useCandidateProfile(applicationId || "");
  const { data: tasksData } = useStudentTasks(applicationId);

  const tasks = tasksData?.data || [];
  const taskProgress = calculateOverallTaskProgress(tasks);

  if (loading) {
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
          {error || "Failed to load candidate information"}
        </p>
      </Card>
    );
  }

  const { profile, studentProfile, internship } = data;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate stroke dash for progress circle
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - taskProgress / 100);

  return (
    <Card className="w-full p-10 bg-white shadow-sm border border-gray-200 rounded-3xl">
      <div className="flex items-center gap-6">
        {/* Profile Avatar */}
        <div className="relative">
          <Avatar className="w-20 h-20">
            <AvatarImage
              src={studentProfile.avatar_url || undefined}
              alt={profile.full_name || "User"}
            />
            <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-white text-xl font-semibold">
              {getInitials(profile.full_name || "NA")}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Candidate Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {profile.full_name || "N/A"}
          </h2>
          <p className="text-gray-600 font-medium mb-3">
            {internship.title || "N/A"}
          </p>

          {/* Contact Details */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{profile.email || "N/A"}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{profile.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Task Progress Circle */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative w-28 h-28">
            {" "}
            <svg className="transform rotate-90 w-28 h-28">
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="#E6E8EC"
                strokeWidth="10"
                fill="none"
              />

              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="#00C271"
                strokeWidth="10"
                fill="none"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - taskProgress / 100)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight">
              <span className="text-base font-semibold text-gray-500">
                {" "}
                {taskProgress}%
              </span>
              <span className="text-[9px] font-medium text-gray-500 mt-0.5">
                {" "}
                Projects Progress
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
