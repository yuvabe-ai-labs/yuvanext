import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { MoveUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTasksByApplicationId } from "@/hooks/useCandidateTask";
import { calculateOverallTaskProgress } from "@/utils/taskProgress";
import { useMemo } from "react";

interface HiredCandidateCardProps {
  id: string;
  name: string;
  avatar_url: string | null;
  internship_title: string;
  duration?: string | null;
  job_type?: string | null;
  unit_name?: string | null;
  unit_avatar_url?: string | null;
}

export default function HiredCandidateCard({
  id,
  name,
  avatar_url,
  internship_title,
  duration,
  job_type,
  unit_name,
  unit_avatar_url,
}: HiredCandidateCardProps) {
  const navigate = useNavigate();

  // Fetch task data to calculate progress
  const { data } = useTasksByApplicationId(id);

  const taskProgress = useMemo(() => {
    if (!data?.tasks || data.tasks.length === 0) return 0;
    return calculateOverallTaskProgress(data.tasks);
  }, [data?.tasks]);

  const formatJobType = (type: string | null | undefined) => {
    if (!type) return "Not specified";
    const jobTypeMap: { [key: string]: string } = {
      full_time: "Full time",
      part_time: "Part time",
      contract: "Contract",
      internship: "Internship",
    };
    return jobTypeMap[type] || type;
  };

  return (
    <Card className="border border-gray-200 rounded-3xl hover:shadow-lg transition-shadow bg-white">
      <CardContent className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-3">{internship_title}</p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {/* Candidate Avatar */}
                <Avatar className="w-16 h-16 border-2 border-white relative z-10">
                  <AvatarImage
                    src={avatar_url || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-200">
                    {name[0]}
                  </AvatarFallback>
                </Avatar>

                {/* Unit Avatar - Same size as candidate */}
                <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center border-2 border-white overflow-hidden relative z-20">
                  {unit_avatar_url ? (
                    <img
                      src={unit_avatar_url}
                      alt="unit"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xl font-bold">X</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{name}</h3>
                <div className="flex items-center gap-1.5">
                  {/* Status with Green Ring */}
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-emerald-500">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  </div>
                  <span className="text-sm text-gray-500">
                    Hired by {unit_name}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right text-xs text-gray-400 font-medium">
            {duration} | {formatJobType(job_type)}
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold text-slate-700">
              Projects Progress
            </span>
            <span className="text-sm font-bold text-slate-700">
              {taskProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${taskProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-teal-600 text-teal-600 hover:bg-teal-50 px-4 h-9 text-xs"
            onClick={() => navigate(`/candidate-tasks/${id}`)}
          >
            View Tasks
            <MoveUpRight className="w-3.5 h-3.5 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
