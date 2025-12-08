import React from "react";

/** Small tag chip component */
export default function Tag({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 mr-2">
      {children}
    </span>
  );
}
