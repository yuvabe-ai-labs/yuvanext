import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAcceptedCandidatesList } from "@/hooks/useMentees";
import { log } from "console";

export default function MenteesList() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch Page 1, limit to 10 items, empty search string.
  const { data: responseData, isLoading } = useAcceptedCandidatesList(1, 10, "");
  console.log("Fetched candidates data:", responseData); // Debug log to check the API response structure
  // Extract the array of candidates
  const candidates = responseData?.data || [];

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 350;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <Card className="border border-border rounded-3xl p-8 mt-6 scrollbar-none">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">Mentees List</h4>
        <button
          className="text-blue-600 font-semibold text-sm hover:text-blue-800 cursor-pointer"
          onClick={() => navigate("/mentees-management")}
        >
          View all
        </button>
      </div>

      <div className="relative mt-4 group">
        <button
          onClick={() => handleScroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          onClick={() => handleScroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide py-4 px-2"
        >
          {isLoading ? (
            <div className="w-full text-center py-8 text-muted-foreground animate-pulse">
              Loading candidates...
            </div>
          ) : candidates.length === 0 ? (
            <div className="w-full text-center py-8 text-muted-foreground">
              No active candidates found.
            </div>
          ) : (
            candidates.map((mentee: any) => {
              // Extract data based on the new API response structure
              const candidate = mentee.candidate;
              const appInfo = mentee.application; // Can be null
              
              const internshipTitle = appInfo?.internshipTitle || "No active internship";
              const status = appInfo?.status || "No active internship";
              const unitName = appInfo?.unitName || "Unknown Unit";
              const skills = Array.isArray(candidate?.skills) ? candidate.skills : [];
              const profileSummary =
                candidate?.profileSummary ||
                "Passionate about creating user-centered digital experiences.";

              // Navigation fallback just in case applicationId is null
              const navId = appInfo?.applicationId || candidate?.userId;

              return (
                <Card
                  key={mentee.requestId}
                  // Added min-h-[380px] to force consistent heights
                  className="min-w-[350px] max-w-[350px] min-h-[380px] border border-border/50 hover:shadow-lg transition-shadow rounded-3xl flex flex-col"
                >
                  {/* flex-1 and flex-col makes the content stretch to fill the card */}
                  <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 flex flex-col flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 sm:gap-5">
                      {/* Avatar */}
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

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 truncate">
                          {candidate?.name || "Unknown"}
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-700 mb-2 truncate">
                          {internshipTitle}
                        </p>

                        <span className="text-xs sm:text-sm font-medium">
                          <span className="text-green-800 capitalize">
                           {status}
                          </span>
                          <span className="text-gray-700">
                            {" "}at {unitName}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Profile Summary - flex-1 pushes everything below it to the bottom */}
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed line-clamp-3 flex-1">
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

                    <div className="border-t border-border/40 my-1"></div>

                    {/* Button - mt-auto ensures it anchors perfectly to the bottom of the card */}
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full mt-auto border-2 border-teal-500 text-teal-600 hover:bg-teal-50 text-sm py-3 rounded-full cursor-pointer"
                      onClick={() => navigate(`/candidate/${navId}`)}
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}