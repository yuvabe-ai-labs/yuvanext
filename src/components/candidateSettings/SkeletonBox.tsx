import React from "react";

/**
 * Simple skeleton block for loading states.
 * You can adjust width/height via className prop.
 */
export default function SkeletonBox({
  className = "h-6 w-full",
  children = null,
}) {
  return (
    <div className={`animate-pulse bg-gray-100 rounded ${className}`.trim()}>
      {children}
    </div>
  );
}
