import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAcceptedCandidatesList } from "@/hooks/useMentees";
import MenteeCard, { type MenteeCardItem } from "@/components/MenteeCard";

export default function MenteesList() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: responseData, isLoading } = useAcceptedCandidatesList(1, 10, "");
  const candidates = responseData?.data || [];

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 370;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">Mentees List</h2>
        <button
          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          onClick={() => navigate("/mentees-management")}
        >
          View all
        </button>
      </div>

      <div className="relative mt-6">
        {candidates.length > 0 && (
          <>
            <button
              aria-label="Scroll mentees left"
              onClick={() => handleScroll("left")}
              className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2.5 shadow-sm transition-colors hover:bg-gray-50 md:block"
            >
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            </button>

            <button
              aria-label="Scroll mentees right"
              onClick={() => handleScroll("right")}
              className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2.5 shadow-sm transition-colors hover:bg-gray-50 md:block"
            >
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="scrollbar-hide flex items-stretch gap-6 overflow-x-auto py-2 md:px-14"
        >
          {isLoading ? (
            <div className="w-full animate-pulse py-16 text-center text-sm text-gray-400">
              Loading mentees...
            </div>
          ) : candidates.length === 0 ? (
            <div className="w-full py-16 text-center text-sm text-gray-400">
              No active mentees found.
            </div>
          ) : (
            candidates.map((mentee: MenteeCardItem) => (
              <MenteeCard
                key={mentee.requestId}
                mentee={mentee}
                className="min-h-[360px] w-[330px] min-w-[330px]"
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
