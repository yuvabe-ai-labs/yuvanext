import { useCallback } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface InfiniteScrollSentinelProps {
  /** Whether another page exists. */
  hasMore: boolean;
  /** Whether the next page is currently in flight. */
  isLoading: boolean;
  onLoadMore: () => void;
  /** Shown once every page has loaded. Omit to render nothing at the end. */
  endMessage?: string;
  className?: string;
}

/**
 * Watches for the end of a list and asks for the next page when it scrolls
 * into view. Render it directly after the list it belongs to.
 */
export default function InfiniteScrollSentinel({
  hasMore,
  isLoading,
  onLoadMore,
  endMessage = "You're all caught up.",
  className = "",
}: InfiniteScrollSentinelProps) {
  // Stable identity so the observer is not torn down on every parent render.
  const handleLoadMore = useCallback(() => onLoadMore(), [onLoadMore]);

  const { observerTarget } = useInfiniteScroll({
    loading: isLoading,
    hasMore,
    onLoadMore: handleLoadMore,
  });

  return (
    <div className={`mt-8 ${className}`}>
      {/* Sits above the fold of the next page so loading starts before the
          user hits the very bottom. */}
      <div ref={observerTarget} className="h-px w-full" aria-hidden="true" />

      {isLoading && (
        <div
          className="space-y-3"
          role="status"
          aria-label="Loading more results"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      )}

      {!hasMore && !isLoading && endMessage && (
        <p className="py-4 text-center text-sm text-gray-400">{endMessage}</p>
      )}
    </div>
  );
}
