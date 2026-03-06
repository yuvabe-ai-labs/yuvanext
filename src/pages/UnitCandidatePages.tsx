import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/Pagination";
import { Search, Users, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMentorUnitCandidatesList } from "@/hooks/useMentorsUnits";
import Navbar from "@/components/Navbar";

export default function UnitCandidatesPage() {
  const navigate = useNavigate();
  const { unitId } = useParams(); 
  
  const [page, setPage] = useState(1);
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
      setPage(1); 
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Fetch from API
  const candidatesQuery = useMentorUnitCandidatesList(unitId as string, page, pageSize, debouncedSearch);

  const items = candidatesQuery.data?.data ?? [];
  const pagination = candidatesQuery.data?.pagination;

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
                {items.map((mentee: any) => {
                  const candidate = mentee.candidate;
                  const appInfo = mentee.application; 

                  const skills = Array.isArray(candidate?.skills) ? candidate.skills : [];
                  const profileSummary = candidate?.profileSummary || "No profile summary available.";
                  
                  // Safe fallback for navigation
                  const profileId = appInfo?.applicationId || candidate?.userId;

                  return (
                    <Card
                      key={mentee.requestId}
                      // Uniform height for all cards
                      className="h-full border border-border/50 hover:shadow-lg transition-shadow rounded-3xl flex flex-col"
                    >
                      <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 flex flex-col flex-1">
                        <div className="flex items-center gap-3 sm:gap-5">
                          {/* shrink-0 prevents avatar from squishing */}
                          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-green-500 shrink-0">
                            <AvatarImage
                              src={candidate?.avatarUrl ?? undefined}
                              alt={candidate?.name ?? "Candidate"}
                              className="object-cover"
                            />
                            <AvatarFallback className="font-semibold bg-gray-200 text-gray-700">
                              {candidate?.name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase() || "C"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 truncate">
                              {candidate?.name || "Unknown"}
                            </h3>

                            <p className="text-xs sm:text-sm text-gray-700 mb-2 truncate">
                              {appInfo?.internshipTitle || "No internship title"}
                            </p>

                            <span className="text-xs sm:text-sm font-medium">
                              <span className="text-green-800 capitalize">Accepted</span>
                              <span className="text-gray-700">
                                {" "}at {appInfo?.unitName || "Unknown Unit"}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* flex-1 pushes button to the bottom */}
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed line-clamp-3 flex-1">
                          {profileSummary}
                        </p>

                        <div className="min-h-7">
                          {skills.length > 0 && (
                            <div className="flex gap-2 overflow-hidden">
                              {skills.length > 3 ? (
                                <>
                                  {skills.slice(0, 3).map((skill: string, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="text-[10px] text-gray-600 bg-muted/40 rounded-full px-2 py-1 whitespace-nowrap"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] text-gray-600 bg-muted/40 rounded-full px-2 py-1 whitespace-nowrap"
                                  >
                                    +{skills.length - 3}
                                  </Badge>
                                </>
                              ) : (
                                skills.map((skill: string, i: number) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-[10px] text-gray-600 bg-muted/40 rounded-full px-2 py-1 whitespace-nowrap"
                                  >
                                    {skill}
                                  </Badge>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        <div className="border-t border-border/40 my-1"></div>

                        {/* mt-auto anchors button to the bottom */}
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full mt-auto border-2 border-teal-500 text-teal-600 hover:bg-teal-50 text-sm py-3 rounded-full cursor-pointer"
                          onClick={() => navigate(`/candidate/${profileId}`)}
                        >
                          View Profile
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

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