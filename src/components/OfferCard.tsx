import { Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import type { AppliedInternshipStatus } from "@/types/internships.types";
import { CandidateDecision } from "@/types/internships.types";
import { useStudentTasks } from "@/hooks/useStudentTasks";
import { calculateOverallTaskProgress } from "@/utils/taskProgress";
import { useState } from "react";

interface OfferCardProps {
  application: AppliedInternshipStatus;
}

export default function OfferCard({ application }: OfferCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const { data: tasksData } = useStudentTasks(application.id);
  const tasks = tasksData?.data || [];
  const taskProgress = calculateOverallTaskProgress(tasks);

  const formattedAppliedDate = application.createdAt
    ? format(new Date(application.createdAt), "MMM dd, yyyy")
    : "Unknown";

  const handleDecision = async (decision: "accept" | "reject") => {
    setIsProcessing(true);
    try {
      // TODO: Implement API call to update candidate decision
      // await updateDecision.mutateAsync({
      //   applicationId: application.id,
      //   decision,
      // });
      console.log("Update decision:", decision);
    } catch (error) {
      console.error("Error updating decision:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isPending =
    application.candidateOfferDecision === CandidateDecision.PENDING ||
    application.candidateOfferDecision === null;
  const isAccepted =
    application.candidateOfferDecision === CandidateDecision.ACCEPT;

  const handleViewTasks = () => {
    navigate(`/my-tasks/${application.id}`);
  };

  // Get internship start and end dates
  const getInternshipDates = () => {
    if (tasks.length === 0) return { startDate: null, endDate: null };

    const dates = tasks
      .filter((task) => task.start_date && task.end_date)
      .flatMap((task) => [new Date(task.start_date), new Date(task.end_date)]);

    if (dates.length === 0) return { startDate: null, endDate: null };

    const startDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const endDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    return { startDate, endDate };
  };

  const { startDate, endDate } = getInternshipDates();

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

      {/* Progress Bar - Only for Accepted Offers */}
      {isAccepted && (
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold text-gray-800">
              Projects Progress
            </h3>
            <span className="text-base font-semibold text-gray-800">
              {taskProgress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${taskProgress}%` }}
            />
          </div>

          {/* Dates */}
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              Started:{" "}
              {startDate ? format(startDate, "dd/MM/yyyy") : "Not started"}
            </span>
            <span className="text-sm text-gray-500">
              Ends: {endDate ? format(endDate, "dd/MM/yyyy") : "No end date"}
            </span>
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
            onClick={() => handleDecision("reject")}
            disabled={isProcessing}
            className="px-4 py-2 border-[1.5px] border-red-500 text-red-600 text-sm font-medium rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Reject Internship"}
          </button>

          <button
            onClick={() => handleDecision("accept")}
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
