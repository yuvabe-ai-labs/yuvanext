import { Check, CircleX } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ApplicationStatusCard({ application }) {
  const date = application.applied_date;
  const formatted = formatDistanceToNow(new Date(date), { addSuffix: true });

  const MAIN_FLOW = ["applied", "shortlisted", "interviewed", "hired"];
  const currentStepIndex = MAIN_FLOW.indexOf(application.status);

  const isRejected = application.status === "rejected";
  const isSelected = application.status === "selected";

  const statusColor = isRejected ? "bg-red-500" : "bg-blue-500";
  const statusTextColor = isRejected ? "text-red-500" : "text-blue-500";
  const statusAccent = isRejected
    ? "text-red-700 font-bold"
    : "text-blue-700 font-bold";

  return (
    <div className="w-full bg-white border border-gray-300 shadow rounded-xl px-7 py-5 mb-2.5">
      {/* Header (omitted for brevity) */}
      <div className="flex justify-between items-center">
        {/* ... header content ... */}
        <div className="flex items-center gap-5">
          {application.internships.profiles.units.avatar_url ? (
            <img
              src={application.internships.profiles.units.avatar_url}
              alt="logo"
              className="w-12 h-12 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <div className="w-12 h-12 rounded-full border border-gray-300 flex justify-center items-center font-bold text-lg">
              {application.internships.profiles.units.unit_name[0]}
            </div>
          )}

          <div>
            <h2 className="font-medium text-lg">
              {application.internships.profiles.units.unit_name}
            </h2>
            <p className="text-gray-500">{application.internships.title}</p>
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
          let circleBg = "bg-white border boder-gray-400 text-gray-400";
          let labelClass = "text-gray-400";

          // Rejected behaviour for final step only
          if (isRejected && index === MAIN_FLOW.length - 1) {
            circleBg = "bg-red-500 text-white";
            labelClass = "text-red-700 font-semibold";
          }
          // Selected should behave like hired (blue)
          else if (isSelected && index === MAIN_FLOW.length - 1) {
            circleBg = "bg-blue-500 text-white";
            labelClass = "text-gray-700 font-semibold";
          }
          // Normal flow (no change)
          else if (isCompleted && !isRejected) {
            circleBg = "bg-blue-500 text-white";
            labelClass = "text-gray-700 font-semibold";
          }

          const isLastStep = index === MAIN_FLOW.length - 1;

          return (
            <div
              key={step}
              className="relative flex flex-col items-center w-1/4"
            >
              {/* Line between circles - POSITION FIXED */}
              {index !== 0 && (
                <div
                  // This class moves the line segment back by half its width,
                  // placing its start point at the previous circle's center.
                  className={`absolute top-[9px] left-[-50%] w-full h-[3px] z-0 
                  ${
                    isLineCompleted && !isRejected ? statusColor : "bg-gray-300"
                  }`}
                ></div>
              )}

              {/* Circle - IN FRONT OF THE LINE (z-index) */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center z-10 
                  ${circleBg}`}
              >
                {/* ICON LOGIC UPDATED */}
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
