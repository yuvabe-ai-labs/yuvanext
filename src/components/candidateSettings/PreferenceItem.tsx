import React from "react";

/**
 * Small clickable preference item that looks like a list row.
 * Accepts children, optional description, right-side indicator.
 */
export default function PreferenceItem({ title, description, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" ? onClick() : null)}
      onClick={onClick}
      className="flex items-center justify-between border-b py-4 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
    >
      <div>
        <div className="text-base font-medium">{title}</div>
        {description && (
          <div className="text-sm text-gray-500 mt-1">{description}</div>
        )}
      </div>

      <div aria-hidden className="text-gray-400">
        ›
      </div>
    </div>
  );
}
