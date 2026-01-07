import { Check, CircleX } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  AppliedInternshipStatus,
  InternshipApplicationStatus,
  UnitDecision,
} from "@/types/internships.types";

interface ApplicationStatusCardProps {
  application: AppliedInternshipStatus;
}

export default function ApplicationStatusCard({
  application,
}: ApplicationStatusCardProps) {
  const date = application.createdAt;
  const formatted = formatDistanceToNow(new Date(date), { addSuffix: true });

  const MAIN_FLOW = ["applied", "shortlisted", "interviewed", "hired"];
  const currentStepIndex = MAIN_FLOW.indexOf(application.status);

  const isRejected = application.unitOfferDecision === UnitDecision.REJECT;
  const isSelected = application.unitOfferDecision === UnitDecision.SELECT;

  const statusColor = isRejected ? "bg-red-500" : "bg-blue-500";
  const statusTextColor = isRejected ? "text-red-500" : "text-blue-500";

  return (
    <div className="w-full bg-white border border-gray-300 shadow rounded-xl px-7 py-5 mb-2.5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5">
          {application.avatarUrl ? (
            <img
              src={application.avatarUrl}
              alt="logo"
              className="w-12 h-12 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <div className="w-12 h-12 rounded-full border border-gray-300 flex justify-center items-center font-bold text-lg">
              {application.unitName[0]}
            </div>
          )}

          <div>
            <h2 className="font-medium text-lg">{application.unitName}</h2>
            <p className="text-gray-500">{application.applicationTitle}</p>
          </div>
        </div>

        <p
          className={`text-xs ${statusTextColor} bg-gray-100 px-3 py-1 rounded-full`}
        >
          Application sent {formatted}
        </p>
      </div>

      {/* Thick line */}
      <div className="w-full h-px my-4 bg-gray-300 shadow-sm"></div>

      {/* Progress */}
      <div className="relative flex items-center justify-between mt-4 w-full">
        {MAIN_FLOW.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isLineCompleted = isCompleted && !isRejected;

          // Determine circle color
          let circleBg = "bg-white border border-gray-400 text-gray-400";
          let labelClass = "text-gray-400";

          const isLastStep = index === MAIN_FLOW.length - 1;

          // Rejected behaviour for final step only
          if (isRejected && isLastStep) {
            circleBg = "bg-red-500 text-white";
            labelClass = "text-red-700 font-semibold";
          }
          // Selected should behave like hired (blue)
          else if (isSelected && isLastStep) {
            circleBg = "bg-blue-500 text-white";
            labelClass = "text-gray-700 font-semibold";
          }
          // Normal flow (no change)
          else if (isCompleted && !isRejected) {
            circleBg = "bg-blue-500 text-white";
            labelClass = "text-gray-700 font-semibold";
          }

          return (
            <div
              key={step}
              className="relative flex flex-col items-center w-1/4"
            >
              {/* Line between circles */}
              {index !== 0 && (
                <div
                  className={`absolute top-[9px] left-[-50%] w-full h-[3px] z-0 
                  ${
                    isLineCompleted && !isRejected ? statusColor : "bg-gray-300"
                  }`}
                ></div>
              )}

              {/* Circle */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center z-10 
                  ${circleBg}`}
              >
                {isRejected && isLastStep ? (
                  <CircleX size={18} />
                ) : isCompleted ? (
                  <Check size={18} />
                ) : null}
              </div>

              {/* Label */}
              <p
                className={`text-sm mt-2 text-center capitalize ${labelClass}`}
              >
                {isRejected && isLastStep ? "rejected" : step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
