import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/Pagination";
import { Search, Building2, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMentorUnitsList } from "@/hooks/useMentorsUnits"; // Use your new hook
import type { MentorUnit } from "@/types/mentor.types";
import Navbar from "@/components/Navbar";

export default function UnitsManagement() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  // This state is what we actually pass to the API after the user stops typing
  const [debouncedSearch, setDebouncedSearch] = useState(""); 
  const pageSize = 6;

  // Search Debounce Logic (Wait 500ms after user stops typing before calling API)
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleSearch = (val: string) => {
    setSearchQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1); // Reset to page 1 on new search
    }, 500);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // 1. Fetch data directly from your API using the backend's search & pagination
  const unitsQuery = useMentorUnitsList(page, pageSize, debouncedSearch);

  const items: MentorUnit[] = unitsQuery.data?.data ?? [];
  const pagination = unitsQuery.data?.pagination;

  return (
    <div className="min-h-screen bg-gray-50">
                  <Navbar />

      {/* Padding matches /mentees-management so both grids line up */}
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
            Units List
          </h2>

          {/* Right */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by names"
              className="pl-10 rounded-full border-gray-300 w-full"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="px-2">
          {/* Content Area */}
          {unitsQuery.isLoading ? (
            <div className="text-center py-20 text-gray-400 font-medium animate-pulse">
              Loading units...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <Building2 className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-400">
                {debouncedSearch ? "No matching units found" : "No Units Found"}
              </h3>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((unit) => {
                  return (
                    <Card
                      key={unit.userId}
                      // ADDED cursor-pointer here
                      // Fills its grid column like MenteeCard does — no max-w or
                      // mx-auto, which would leave big gaps between cards. min-h
                      // (not a fixed h) keeps the name and description from
                      // being squashed and clipped mid-line.
                      className="relative flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-[#C94100] bg-white shadow-sm transition-all duration-300 hover:shadow-md min-h-[300px] p-1.5 cursor-pointer"
                      // ADDED onClick to navigate to the unit details page
                      onClick={() => navigate(`/units/${unit.userId}`)}
                    >
                      {/* Banner — the unit's own image, falling back to the
                          plain blue ground when it has none. */}
                      <div className="relative w-full h-[124px] shrink-0 rounded-t-[18px] overflow-visible bg-blue-100">
                        {unit.bannerUrl && (
                          <img
                            src={unit.bannerUrl}
                            alt=""
                            className="absolute inset-0 h-full w-full rounded-t-[18px] object-cover"
                            onError={(e) => {
                              // Broken link → uncover the blue fallback.
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}

                        {/* Avatar */}
                        <div className="absolute bottom-0 left-5 translate-y-1/6 w-[56px] h-[56px] flex items-center justify-center z-20 rounded-full bg-black text-white border-2 border-white shadow-md">
                          {unit.avatarUrl ? (
                            <img
                              src={unit.avatarUrl}
                              alt={`${unit.name} logo`}
                              className="w-[52px] h-[52px] object-cover rounded-full bg-white"
                            />
                          ) : (
                            <span className="text-xl font-bold uppercase">{unit.name?.charAt(0) || "U"}</span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="-mt-[28px] bg-white rounded-[18px] pt-[40px] pb-[20px] px-[16px] z-10 relative flex flex-1 flex-col">
                        <h3 className="text-[20px] font-semibold text-black leading-tight text-left truncate shrink-0 py-[2px]">
                          {unit.name}
                        </h3>

                        {unit.industry && (
                          <span className="text-xs text-blue-600 font-medium mt-1 uppercase tracking-wider text-left shrink-0">
                            {unit.industry}
                          </span>
                        )}

                        <p className="text-[14px] text-gray-600 mt-2 line-clamp-3 text-left flex-grow shrink-0">
                          {unit.description || "No description provided for this unit."}
                        </p>

                        <div className="flex justify-center mt-auto pt-2 shrink-0">
                          <Button
                            variant="link"
                            className="text-[#0B5FFF] font-medium p-0 hover:text-blue-700"
                            onClick={(e) => {
                              // This prevents the card's click event from firing when the button is clicked
                              e.stopPropagation();
                              navigate(`/units/${unit.userId}`);
                            }}
                          >
                            View Unit
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                  className="mt-10"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}