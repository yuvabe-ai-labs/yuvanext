import React from "react";

interface StatCardProps {
  title: string;
  count: number | string | undefined;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  subText?: string;
}

export default function StatCard({
  title,
  count,
  active,
  onClick,
  icon,
  bgColor,
  borderColor,
  subText,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-2xl p-5 shadow-sm cursor-pointer transition-all ${
        active
          ? `${borderColor} ring-opacity-20 shadow-md`
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-800">
            {/* Handle both numbers and strings, padding numbers to 2 digits */}
            {typeof count === "number"
              ? count.toString().padStart(2, "0")
              : (count ?? "00")}
          </p>
          {subText && (
            <p className="text-[10px] text-teal-600 mt-1 font-medium">
              {subText}
            </p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function StatHeaderCard({
  title,
  count,
  icon,
}: {
  title: string;
  count?: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center bg-white border border-gray-300 rounded-lg p-5 shadow-sm">
      <div>
        <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase">
          {title}
        </p>
        <p className="text-2xl font-medium text-gray-600">
          {(count ?? 0).toString().padStart(2, "0")}
        </p>
      </div>
      <div className="w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
