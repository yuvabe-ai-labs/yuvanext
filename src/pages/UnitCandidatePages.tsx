import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Users, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useInfiniteMentorUnitCandidates } from "@/hooks/useMentorsUnits";
import Navbar from "@/components/Navbar";
import MenteeCard, { type MenteeCardItem } from "@/components/MenteeCard";
import InfiniteScrollSentinel from "@/components/InfiniteScrollSentinel";
import { flattenPages } from "@/lib/infinite-query";

export default function UnitCandidatesPage() {
  const navigate = useNavigate();
  const { unitId } = useParams(); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const pageSize = 6;

  // Search Debounce Logic
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Fetch from API with infinite scroll
  const candidatesQuery = useInfiniteMentorUnitCandidates(
    unitId as string,
    pageSize,
    debouncedSearch,
  );

  const items = useMemo(
    () =>
      flattenPages(candidatesQuery.data?.pages, (mentee) => mentee.requestId),
    [candidatesQuery.data],
  );

  return (
    <div className="min-h-screen bg-gray-50">
        <Navbar />
      {/* Responsive padding adjustments */}
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-20 xl:px-40 py-6 lg:py-10">
        <div className="relative flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-md font-medium text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          </div>

          <h2 className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 text-2xl font-bold text-gray-600 whitespace-nowrap">
            Unit Candidates
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by candidate name"
              className="pl-10 rounded-full border-gray-300 w-full"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="px-2">
          {candidatesQuery.isLoading ? (
            <div className="text-center py-20 text-gray-400 font-medium animate-pulse">
              Loading candidates...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <Users className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-400">
                {debouncedSearch ? "No matching candidates found" : "No candidates applied to this unit"}
              </h3>
            </div>
          ) : (
            <>
              {/* CSS Grid handles responsive width naturally */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((mentee: MenteeCardItem) => (
                  <MenteeCard key={mentee.requestId} mentee={mentee} />
                ))}
              </div>

              <InfiniteScrollSentinel
                hasMore={candidatesQuery.hasNextPage}
                isLoading={candidatesQuery.isFetchingNextPage}
                onLoadMore={candidatesQuery.fetchNextPage}
                endMessage="No more candidates to load."
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}