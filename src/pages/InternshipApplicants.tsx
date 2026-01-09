import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

// 1. IMPORT HOOK
import { useInternshipApplicants } from "@/hooks/useInternshipApplicants";

const InternshipApplicants = () => {
  const { internshipId } = useParams<{ internshipId: string }>();
  const navigate = useNavigate();

  // 2. USE HOOK
  const { data: applicants = [], isLoading: loading } =
    useInternshipApplicants(internshipId);

  // Removed: filteredApplications state
  const [displayCount, setDisplayCount] = useState(6);
  const observerTarget = useRef<HTMLDivElement>(null);

  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Derived Values
  const internshipTitle =
    applicants.length > 0 ? applicants[0].internshipTitle : "Internship";

  //  - Diagram showing how useMemo prevents re-calculation/re-render
  // FIX: Use useMemo instead of useEffect for filtering
  const filteredApplications = useMemo(() => {
    let result = applicants;
    if (statusFilter) {
      result = result.filter((app) => app.status === statusFilter);
    }
    return result;
  }, [applicants, statusFilter]);

  // Reset display count when filter changes (using effect only for this side effect)
  useEffect(() => {
    setDisplayCount(6);
  }, [statusFilter]);

  // Infinite Scroll Observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && displayCount < filteredApplications.length) {
        setDisplayCount((prev) =>
          Math.min(prev + 6, filteredApplications.length)
        );
      }
    },
    [displayCount, filteredApplications.length]
  );

  useEffect(() => {
    const element = observerTarget.current;
    const option = { threshold: 0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (element) observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  // --- HELPERS ---

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      shortlisted: {
        label: "Shortlisted",
        className: "bg-green-100 text-green-700",
      },
      applied: { label: "Applied", className: "bg-orange-100 text-orange-700" },
      not_shortlisted: {
        label: "Not Shortlisted",
        className: "bg-red-100 text-red-700",
      },
      rejected: {
        label: "Not Shortlisted",
        className: "bg-red-100 text-red-700",
      },
      interviewed: {
        label: "Interviewed",
        className: "bg-blue-100 text-blue-700",
      },
      hired: { label: "Hired", className: "bg-purple-100 text-purple-700" },
    };
    const config = statusConfig[status] || statusConfig.applied;
    return (
      <Badge className={`text-xs ${config.className}`}>{config.label}</Badge>
    );
  };

  const getMatchColor = (score: number) => {
    if (score === 100) return "border-purple-500";
    if (score > 90) return "border-green-500";
    if (score >= 80) return "border-blue-500";
    if (score >= 60) return "border-orange-500";
    return "border-red-500";
  };

  const getDaysAgo = (date?: string) => {
    if (!date) return 0; // Default to 0 if date is missing
    const now = new Date();
    const appliedDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - appliedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/unit-dashboard")}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>

          <h1 className="text-2xl font-semibold text-center flex-1">
            Applicants for{" "}
            {loading ? (
              <Skeleton className="h-8 w-40 inline-block align-middle" />
            ) : (
              internshipTitle
            )}
          </h1>

          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] justify-between rounded-full text-gray-500"
                >
                  {statusFilter
                    ? statusFilter.charAt(0).toUpperCase() +
                      statusFilter.slice(1)
                    : "Filter Status"}
                  <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[180px] rounded-2xl p-2"
              >
                {[
                  "applied",
                  "shortlisted",
                  "interviewed",
                  "hired",
                  "not_shortlisted",
                ].map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() =>
                      setStatusFilter(status === statusFilter ? null : status)
                    }
                    className="flex items-center gap-2"
                  >
                    <Checkbox checked={statusFilter === status} />
                    <span className="capitalize">
                      {status.replace("_", " ")}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="container mx-auto px-2 md:px-10 py-2">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border border-border/50 rounded-3xl">
                  <CardContent className="p-6">
                    <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-5 w-32 mx-auto mb-2" />
                    <Skeleton className="h-4 w-24 mx-auto mb-3" />
                    <Skeleton className="h-3 w-full mb-4" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No Applicants Found</h3>
              <p className="text-muted-foreground">
                {statusFilter
                  ? "No applicants match the selected filter."
                  : "No one has applied to this internship yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApplications.slice(0, displayCount).map((app) => {
                  // NOTE: Backend needs to provide appliedDate
                  // If missing, this defaults to 0
                  const daysAgo = getDaysAgo(app.appliedDate);

                  // NOTE: Backend needs to provide matchScore if we want the colored rings back
                  const matchScore = 0;

                  return (
                    <Card
                      key={app.applicationId}
                      className="border border-border/50 hover:shadow-lg transition-shadow rounded-3xl"
                    >
                      <CardContent className="p-8 space-y-5">
                        <div className="flex items-center gap-5">
                          {/* Avatar with Ring */}
                          <div className="relative flex-shrink-0">
                            <Avatar
                              className={`w-20 h-20 ring-4 ${getMatchColor(
                                matchScore
                              )}`}
                            >
                              <AvatarImage
                                src={app.candidateAvatarUrl || undefined}
                                alt={app.candidateName}
                              />
                              <AvatarFallback className="text-lg font-semibold bg-gray-100">
                                {(app.candidateName || "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -top-2 -right-2">
                              {getStatusBadge(app.status)}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1 text-gray-900 truncate">
                              {app.candidateName}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate mb-2">
                              {app.internshipTitle}
                            </p>

                            {/* Days Ago Badge - Needs 'appliedDate' from Backend */}
                            <Badge className="bg-yellow-500 text-white hover:bg-yellow-500 pointer-events-none">
                              Applied {daysAgo} {daysAgo === 1 ? "day" : "days"}{" "}
                              ago
                            </Badge>
                          </div>
                        </div>

                        {/* Profile Summary / Bio - Needs 'profileSummary' from Backend */}
                        <p className="text-base text-gray-700 leading-relaxed line-clamp-3">
                          {app.profileSummary ||
                            "No profile summary available."}
                        </p>

                        {/* Skills */}
                        <div className="min-h-7">
                          {app.candidateSkills &&
                          app.candidateSkills.length > 0 ? (
                            <div className="flex gap-2 overflow-hidden flex-wrap">
                              {app.candidateSkills
                                .slice(0, 3)
                                .map((skill, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-[10px] text-gray-600 bg-muted/40 rounded-full px-2 py-1"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              {app.candidateSkills.length > 3 && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] text-gray-600 bg-muted/40 rounded-full px-2 py-1"
                                >
                                  +{app.candidateSkills.length - 3}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              No skills listed
                            </p>
                          )}
                        </div>

                        <div className="border-t border-border/40"></div>

                        <Button
                          variant="outline"
                          className="w-full border-2 border-teal-500 text-teal-600 hover:bg-teal-50 text-sm py-5 rounded-full mt-4"
                          onClick={() =>
                            navigate(`/candidate/${app.applicationId}`)
                          }
                        >
                          View Profile
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {displayCount < filteredApplications.length && (
                <div
                  ref={observerTarget}
                  className="flex justify-center mt-8 py-4"
                >
                  <Button
                    variant="link"
                    onClick={() => setDisplayCount((prev) => prev + 6)}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default InternshipApplicants;
