import { ChevronRight } from "lucide-react";
import React from "react";

/**
 * Small clickable preference item that looks like a list row.
 * Accepts children, optional description, right-side indicator.
 */
export default function PreferenceItem({ title, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" ? onClick() : null)}
      onClick={onClick}
      className="flex items-center justify-between border-b border-gray-200 py-5 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
    >
      <div className="text-base  text-gray-600 font-medium">{title}</div>

      <ChevronRight aria-hidden className="text-gray-400" />
    </div>
  );
}
