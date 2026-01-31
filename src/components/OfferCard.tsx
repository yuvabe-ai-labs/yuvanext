import { Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import type { AppliedInternshipStatus } from "@/types/internships.types";
import { CandidateDecision } from "@/types/internships.types";
import { useUpdateCandidateDecision } from "@/hooks/useInternships";
import { useState } from "react";
import { useCandidateTasks } from "@/hooks/useCandidateTasks";
import { TaskStatus } from "@/types/candidateTasks.types";

interface OfferCardProps {
  application: AppliedInternshipStatus;
}

export default function OfferCard({ application }: OfferCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const updateDecision = useUpdateCandidateDecision();

  const isAccepted =
    application.candidateOfferDecision === CandidateDecision.ACCEPT;
  const { data: tasksData } = useCandidateTasks(
    isAccepted ? application.id : "",
  );

  const formattedAppliedDate = application.createdAt
    ? format(new Date(application.createdAt), "MMM dd, yyyy")
    : "Unknown";

  const handleDecision = async (
    decision: CandidateDecision.ACCEPT | CandidateDecision.REJECT,
  ) => {
    setIsProcessing(true);
    try {
      await updateDecision.mutateAsync({
        applicationId: application.id,
        decision,
      });
    } catch (error) {
      console.error("Error updating decision:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isPending =
    application.candidateOfferDecision === CandidateDecision.PENDING ||
    application.candidateOfferDecision === null;

  const handleViewTasks = () => {
    navigate(`/my-tasks/${application.id}`);
  };

  // Calculate task progress
  const calculateProgress = () => {
    if (!tasksData?.tasks || tasksData.tasks.length === 0) {
      return { percentage: 0, completed: 0, total: 0 };
    }

    const total = tasksData.tasks.length;
    const completed = tasksData.tasks.filter(
      (task) => task.taskStatus === TaskStatus.ACCEPTED,
    ).length;
    const percentage = Math.round((completed / total) * 100);

    return { percentage, completed, total };
  };

  const progress = isAccepted ? calculateProgress() : null;

  return (
    <div className="w-full bg-white border border-gray-300 shadow rounded-3xl px-7 py-6 mb-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          {application.avatarUrl ? (
            <img
              src={application.avatarUrl}
              alt={application.unitName}
              className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-full border-2 border-gray-200 flex justify-center items-center font-bold text-xl">
              {application.unitName[0]}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-xl text-gray-800">
              {application.unitName}
            </h2>
            <p className="text-gray-600 text-base">
              {application.applicationTitle}
            </p>
          </div>
        </div>

        {/* View Tasks Button for Accepted Offers */}
        {isAccepted && (
          <button
            onClick={handleViewTasks}
            className="flex items-center gap-2 px-5 py-2.5 border-[1.5px] border-orange-500 text-orange-600 text-sm font-medium rounded-full hover:bg-orange-50 transition-colors"
          >
            View Tasks
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* Task Progress Bar for Accepted Internships */}
      {isAccepted && progress && (
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Task Progress
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {progress.completed}/{progress.total} tasks completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {progress.percentage}% Complete
            </span>
            {progress.percentage === 100 && (
              <span className="text-xs font-medium text-green-600">
                ✓ All tasks completed!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Details */}
      {!isAccepted && (
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2 text-gray-700">
            <Clock size={18} className="text-gray-500" />
            <span className="text-sm">
              <span className="font-medium">Applied:</span>{" "}
              {formattedAppliedDate}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isPending && (
        <div className="flex justify-end gap-3 mt-3">
          <button
            onClick={() => handleDecision(CandidateDecision.REJECT)}
            disabled={isProcessing}
            className="px-4 py-2 border-[1.5px] border-red-500 text-red-600 text-sm font-medium rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Reject Internship"}
          </button>

          <button
            onClick={() => handleDecision(CandidateDecision.ACCEPT)}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Accept Internship"}
          </button>
        </div>
      )}

      {/* Status Message */}
      {!isPending && !isAccepted && (
        <div className="mt-4 text-center py-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            You have declined this internship offer
          </p>
        </div>
      )}
    </div>
  );
}
