import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/Pagination";
import { Search, Users, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMenteesApplicationsList } from "@/hooks/useMentees"; // Updated Hook

export default function MenteesManagement() {
  const navigate = useNavigate();
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
      setPage(1); // Reset to page 1 on new search
    }, 500);
  };

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Fetch from API with server-side pagination & search
  const menteesQuery = useMenteesApplicationsList(page, pageSize, debouncedSearch);

  const items = menteesQuery.data?.data ?? [];
  const pagination = menteesQuery.data?.pagination;

  const getStatusColor = (status?: string) => {
    if (!status) return "text-gray-800";
    switch (status.toLowerCase()) {
      case "hired":
        return "text-green-800";
      case "interview":
        return "text-blue-800";
      case "applied":
        return "text-yellow-800";
      case "rejected":
        return "text-red-800";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto px-4 sm:px-12 lg:px-40 py-6 lg:py-10">
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
              placeholder="Search by names or roles"
              className="pl-10 rounded-full border-gray-300 w-full"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="px-2 lg:px-10">
          {/* Content Area */}
          {menteesQuery.isLoading ? (
            <div className="text-center py-20 text-gray-400 font-medium animate-pulse">
              Loading candidates...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <Users className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-400">
                {debouncedSearch ? "No matching applications found" : "No Applications Found"}
              </h3>
            </div>
          ) : (
            <>
              {/* Mentees Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((application: any) => {
                  // Destructure the nested backend response
                  const candidate = application.candidate;
                  const internship = application.internship;
                  const unit = internship?.unit;

                  const skills = Array.isArray(candidate?.skills) ? candidate.skills : [];
                  const profileSummary = candidate?.profileSummary || "No profile summary available.";

                  return (
                    <Card
                      key={application.applicationId}
                      className="min-w-[350px] border border-border/50 hover:shadow-lg transition-shadow rounded-3xl flex flex-col"
                    >
                      <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
                        {/* Header */}
                        <div className="flex items-center gap-3 sm:gap-5">
                          {/* Avatar */}
                          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-green-500">
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

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 truncate">
                              {candidate?.name || "Unknown"}
                            </h3>

                            <p className="text-xs sm:text-sm text-gray-700 mb-2 truncate">
                              {internship?.title || "No internship"}
                            </p>

                            <span className="text-xs sm:text-sm font-medium capitalize">
                              <span
                                className={getStatusColor(application.status)}
                              >
                                {application.status}
                              </span>
                              <span className="text-black-700">
                                {" "}
                                at {unit?.name || "Unknown Unit"}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Profile Summary */}
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed line-clamp-3">
                          {profileSummary}
                        </p>

                        {/* Skills */}
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

                        <div className="border-t border-border/40"></div>

                        {/* Button */}
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full border-2 border-teal-500 text-teal-600 hover:bg-teal-50 text-sm py-3 rounded-full cursor-pointer"
                          onClick={() =>
                            navigate(`/candidate/${application.applicationId}`)
                          }
                        >
                          View Profile
                        </Button>
                      </CardContent>
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