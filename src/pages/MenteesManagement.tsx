import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/Pagination";
import { Search, Users, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRecentMentees } from "@/hooks/useMentees";

export default function MenteesManagement() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 6;

  // Fetch all mentees
  const menteesQuery = useRecentMentees(page, pageSize);

  const rawItems = menteesQuery.data?.data ?? [];
  const pagination = menteesQuery.data?.pagination;

  // Client-side filtering for search (API should handle this in production)
  const items = searchQuery
    ? rawItems.filter((item: any) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : rawItems;

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const getStatusColor = (status: string) => {
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
      {/* <Navbar /> */}
      <div className="w-full mx-auto px-4 sm:px-12 lg:px-40 py-6 lg:py-10">
        <div className="relative flex items-center mb-6">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-md font-medium text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          </div>

          {/* Center title */}
          <h2 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-gray-600 whitespace-nowrap">
            Mentees List
          </h2>

          {/* Right */}
          <div className="ml-auto relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by names"
              className="pl-10 rounded-full border-gray-300"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="px-2 lg:px-10">
          {/* Content Area */}
          {menteesQuery.isLoading ? (
            <div className="text-center py-20 text-gray-400 font-medium">
              Loading data...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <Users className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-400">
                No Mentees Found
              </h3>
            </div>
          ) : (
            <>
              {/* Mentees Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((mentee: any) => {
                  const skills = Array.isArray(mentee.skills)
                    ? mentee.skills
                    : [];
                  const interests = Array.isArray(mentee.interests)
                    ? mentee.interests
                    : [];
                  const profileSummary =
                    mentee.profileSummary || "No profile summary available.";

                  return (
                    <Card
                      key={mentee.candidateId}
                      className="min-w-[350px] border border-border/50 hover:shadow-lg transition-shadow rounded-3xl flex flex-col"
                    >
                      <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
                        {/* Header */}
                        <div className="flex items-center gap-3 sm:gap-5">
                          {/* Avatar */}
                          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-green-500">
                            <AvatarImage
                              src={mentee.avatarUrl ?? undefined}
                              alt={mentee.name ?? "Candidate"}
                              className="object-cover"
                            />
                            <AvatarFallback className="font-semibold bg-gray-200 text-gray-700">
                              {mentee.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() || "C"}
                            </AvatarFallback>
                          </Avatar>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 truncate">
                              {mentee.name || "Unknown"}
                            </h3>

                            <p className="text-xs sm:text-sm text-gray-700 mb-2 truncate">
                              {mentee.internshipName || "No internship"}
                            </p>

                            <span className="text-xs sm:text-sm font-medium capitalize">
                              <span
                                className={getStatusColor(
                                  mentee.applicationStatus,
                                )}
                              >
                                {mentee.applicationStatus}
                              </span>
                              <span className="text-black-700">
                                {" "}
                                at {mentee.AppliedAt}
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
                                  {skills.slice(0, 3).map((skill, i) => (
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
                                skills.map((skill, i) => (
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
                          {skills.length === 0 && interests.length > 0 && (
                            <div className="flex gap-2 overflow-hidden">
                              {interests.slice(0, 3).map((interest, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-[10px] text-gray-600 bg-muted/40 rounded-full px-2 py-1 whitespace-nowrap"
                                >
                                  {interest}
                                </Badge>
                              ))}
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
                            navigate(`/candidate/${mentee.applicationId}`)
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
              <Pagination
                currentPage={page}
                totalPages={pagination?.totalPages || 1}
                onPageChange={setPage}
                className="mt-10"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
