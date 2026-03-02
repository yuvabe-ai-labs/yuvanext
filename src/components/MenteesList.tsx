import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMenteesApplications } from "@/hooks/useMentees"; // Import your new hook

export default function MenteesList() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 1. Fetch live data
  const { data: responseData, isLoading } = useMenteesApplications();
  
  // Extract the array of applications from the response wrapper
  const candidates = responseData?.data || [];

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const getStatusColor = (status: string) => {
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
    <Card className="border border-border rounded-3xl p-8 mt-6 scrollbar-none">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">Mentees List</h4>
        <button
          className="text-blue-600 font-semibold text-sm hover:text-blue-800 cursor-pointer"
          onClick={() => navigate("/candidate-management")}
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
              No applied candidates found.
            </div>
          ) : (
            candidates.map((application: any) => {
              // Extracting data dynamically based on your backend response structure
              const candidate = application.candidate;
              const internship = application.internship;
              const unit = internship?.unit;
              
              const skills = candidate?.skills ?? [];
              const interests = []; // Backend doesn't return interests currently
              const profileSummary =
                candidate?.profileSummary ??
                "Passionate about creating user-centered digital experiences.";

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
                          {internship?.title || "No internship title"}
                        </p>

                        <span className="text-xs sm:text-sm font-medium capitalize">
                          <span className={getStatusColor(application.status)}>
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
            })
          )}
        </div>
      </div>
    </Card>
  );
}