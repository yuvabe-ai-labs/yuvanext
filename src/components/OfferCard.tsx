import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ListTodo,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import type { Offer } from "@/types/myOffers.types";
import { useUpdateOfferDecision } from "@/hooks/useMyOffers";
import { useStudentTasks } from "@/hooks/useStudentTasks";
import { calculateOverallTaskProgress } from "@/utils/taskProgress";
import { useState } from "react";

interface OfferCardProps {
  offer: Offer;
}

export default function OfferCard({ offer }: OfferCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const updateDecision = useUpdateOfferDecision();
  const navigate = useNavigate();

  const { data: tasksData } = useStudentTasks(offer.application_id);
  const tasks = tasksData?.data || [];
  const taskProgress = calculateOverallTaskProgress(tasks);

  const formattedAppliedDate = offer.applied_date
    ? format(new Date(offer.applied_date), "MMM dd, yyyy")
    : "Unknown";

  const handleDecision = async (decision: "accepted" | "rejected") => {
    setIsProcessing(true);
    try {
      await updateDecision.mutateAsync({
        applicationId: offer.application_id,
        decision,
      });
    } catch (error) {
      console.error("Error updating decision:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isPending = offer.offer_decision === "pending";
  const isAccepted = offer.offer_decision === "accepted";

  const handleViewTasks = () => {
    navigate(`/my-tasks/${offer.application_id}`);
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
          <img
            src={offer.internship.company_profile.unit.avatar_url}
            alt={offer.internship.company_profile.unit.unit_name}
            className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
          />
          <div>
            <h2 className="font-semibold text-xl text-gray-800">
              {offer.internship.company_profile.unit.unit_name}
            </h2>
            <p className="text-gray-600 text-base">{offer.internship.title}</p>
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
              <span className="font-medium">Duration:</span>{" "}
              {offer.internship.duration}
            </span>
          </div>

          <div className="text-sm text-gray-600 leading-relaxed mt-3">
            <p className="line-clamp-2">{offer.internship.description}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isPending && (
        <div className="flex justify-end gap-3 mt-3">
          <button
            onClick={() => handleDecision("rejected")}
            disabled={isProcessing}
            className="px-4 py-2 border-[1.5px] border-red-500 text-red-600 text-sm font-medium rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Reject Internship"}
          </button>

          <button
            onClick={() => handleDecision("accepted")}
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
