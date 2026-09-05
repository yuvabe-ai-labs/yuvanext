import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useInfiniteAcceptedCandidates } from "@/hooks/useMentees";
import Navbar from "@/components/Navbar";
import MenteeCard, { type MenteeCardItem } from "@/components/MenteeCard";
import InfiniteScrollSentinel from "@/components/InfiniteScrollSentinel";
import { flattenPages } from "@/lib/infinite-query";

export default function MenteesManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const pageSize = 6;
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Search Debounce Logic
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (val: string) => {
    setSearchQuery(val);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setDebouncedSearch(val.trim());
    }, 500);
  };

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Fetch from API with infinite scroll & server-side search
  const menteesQuery = useInfiniteAcceptedCandidates(pageSize, debouncedSearch);

  const items = useMemo(
    () =>
      flattenPages(menteesQuery.data?.pages, (mentee) => mentee.requestId),
    [menteesQuery.data],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((mentee: MenteeCardItem) => {
      const candidate = mentee.candidate;
      const application = mentee.application;

      const searchableFields = [
        candidate?.name,
        candidate?.email,
        candidate?.experienceLevel,
        application?.internshipTitle,
        application?.status,
        application?.unitName,
      ];

      return searchableFields.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(normalizedQuery),
      );
    });
  }, [items, deferredSearchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Adjusted padding: lg:px-20 for laptops, xl:px-40 for large desktops */}
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-20 xl:px-40 py-6 lg:py-10">
        <div className="relative flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          {/* Left */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-md font-medium text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          </div>

          {/* Center title */}
          <h2 className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 text-2xl font-bold text-gray-600 whitespace-nowrap">
            Mentees List
          </h2>

          {/* Right */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name"
              className="pl-10 rounded-full border-gray-300 w-full"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="px-2">
          {/* Content Area */}
          {menteesQuery.isLoading && !menteesQuery.data ? (
            <div className="text-center py-20 text-gray-400 font-medium animate-pulse">
              Loading candidates...
            </div>
          ) : menteesQuery.isFetching &&
            !menteesQuery.isFetchingNextPage &&
            searchQuery.trim() &&
            filteredItems.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-medium animate-pulse">
              Updating results...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <Users className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-400">
                {searchQuery.trim()
                  ? "No matching candidates found"
                  : "No Candidates Found"}
              </h3>
            </div>
          ) : (
            <>
              {menteesQuery.isFetching &&
              !menteesQuery.isFetchingNextPage &&
              searchQuery.trim() ? (
                <p className="mb-4 text-sm text-gray-400">
                  Updating results...
                </p>
              ) : null}

              {/* Mentees Grid - CSS Grid handles width automatically now */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map((mentee: MenteeCardItem) => (
                  <MenteeCard key={mentee.requestId} mentee={mentee} />
                ))}
              </div>

              <InfiniteScrollSentinel
                hasMore={menteesQuery.hasNextPage}
                isLoading={menteesQuery.isFetchingNextPage}
                onLoadMore={menteesQuery.fetchNextPage}
                endMessage="No more mentees to load."
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
