import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  Search,
  Bell,
  Menu,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import type { ApplicationWithDetails } from "@/hooks/useUnitApplications";
import Navbar from "@/components/Navbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const InternshipApplicants = () => {
  const { internshipId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>(
    []
  );
  const [filteredApplications, setFilteredApplications] = useState<
    ApplicationWithDetails[]
  >([]);
  const [internshipTitle, setInternshipTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(6);
  const [filters, setFilters] = useState({
    exact: false,
    above90: false,
    between80and90: false,
    between60and80: false,
  });
  const observerTarget = useRef(null);

  const safeParse = (data: any, fallback: any) => {
    if (!data) return fallback;
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return fallback;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      shortlisted: {
        label: "Shortlisted",
        className: "bg-green-100 text-green-700",
      },
      applied: { label: "Applied", className: "bg-orange-100 text-orange-700" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
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

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);

        // Fetch internship details
        const { data: internship, error: internshipError } = await supabase
          .from("internships")
          .select("title")
          .eq("id", internshipId)
          .maybeSingle();

        if (internshipError) throw internshipError;
        setInternshipTitle(internship?.title || "");

        // Fetch applications for this internship
        const { data: applicationsData, error: appsError } = await supabase
          .from("applications")
          .select("*")
          .eq("internship_id", internshipId)
          .order("applied_date", { ascending: false });

        if (appsError) throw appsError;

        // Fetch related data for each application
        const applicationsWithDetails = await Promise.all(
          (applicationsData || []).map(async (app) => {
            const [internshipRes, profileRes, studentProfileRes] =
              await Promise.all([
                supabase
                  .from("internships")
                  .select("*")
                  .eq("id", app.internship_id)
                  .maybeSingle(),
                supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", app.student_id)
                  .maybeSingle(),
                supabase
                  .from("student_profiles")
                  .select("*")
                  .eq("profile_id", app.student_id)
                  .maybeSingle(),
              ]);

            if (!internshipRes.data || !profileRes.data) {
              return null;
            }

            // Calculate match score if not already set
            let matchScore = app.profile_match_score;
            if (
              matchScore === null ||
              matchScore === undefined ||
              matchScore === 0
            ) {
              const { calculateComprehensiveMatchScore } = await import(
                "@/utils/matchScore"
              );
              matchScore = calculateComprehensiveMatchScore(
                {
                  studentProfile: studentProfileRes.data,
                  profile: profileRes.data,
                },
                internshipRes.data
              );

              // Update the application with the calculated score
              if (matchScore > 0) {
                await supabase
                  .from("applications")
                  .update({ profile_match_score: matchScore })
                  .eq("id", app.id);
              }
            }

            return {
              ...app,
              profile_match_score: matchScore,
              internship: internshipRes.data,
              profile: profileRes.data,
              studentProfile: studentProfileRes.data || {
                id: "",
                profile_id: app.student_id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                skills: [],
                avatar_url: null,
                bio: null,
                location: null,
                portfolio_url: null,
                resume_url: null,
                behance_url: null,
                dribbble_url: null,
                linkedin_url: null,
                education: [],
                projects: [],
                languages: [],
                completed_courses: null,
                interests: [],
                experience_level: null,
                looking_for: [],
                profile_type: null,
                preferred_language: null,
                cover_letter: null,
                website_url: null,
              },
            };
          })
        );

        const validApplications = applicationsWithDetails.filter(
          (app) => app !== null
        ) as ApplicationWithDetails[];
        setApplications(validApplications);
        setFilteredApplications(validApplications);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (internshipId) {
      fetchApplications();
    }
  }, [internshipId]);

  // Filter applications based on match score
  useEffect(() => {
    if (
      !filters.exact &&
      !filters.above90 &&
      !filters.between80and90 &&
      !filters.between60and80
    ) {
      setFilteredApplications(applications);
      return;
    }

    const filtered = applications.filter((app) => {
      const matchScore = app.profile_match_score || 0;

      if (filters.exact && matchScore === 100) return true;
      if (filters.above90 && matchScore > 90 && matchScore < 100) return true;
      if (filters.between80and90 && matchScore >= 80 && matchScore <= 90)
        return true;
      if (filters.between60and80 && matchScore >= 60 && matchScore < 80)
        return true;

      return false;
    });

    setFilteredApplications(filtered);
    setDisplayCount(6);
  }, [filters, applications]);

  // Infinite scroll
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

  const getMatchColor = (score: number) => {
    if (score === 100) return "border-purple-500";
    if (score > 90) return "border-green-500";
    if (score >= 80) return "border-blue-500";
    if (score >= 60) return "border-orange-500";
    return "border-red-500";
  };

  const getMatchTextColor = (score: number) => {
    if (score === 100) return "text-purple-600";
    if (score > 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getDaysAgo = (date: string) => {
    const now = new Date();
    const appliedDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - appliedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* Back Button and Title */}
        <div className="flex items-center justify-between mb-8">
          {/* Left: Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/unit-dashboard")}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {/* Center: Title */}
          <h1 className="text-2xl font-semibold text-center flex-1">
            Applicants for {internshipTitle}
          </h1>

          {/* Right: Filter Dropdown */}
          {/* <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[250px] justify-between rounded-full text-gray-500"
                >
                  {Object.values(filters).some(Boolean)
                    ? `${
                        Object.values(filters).filter(Boolean).length
                      } Selected`
                    : "Select Matches"}
                  <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="w-[250px] rounded-2xl p-2 space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="exact"
                    checked={filters.exact}
                    onCheckedChange={(checked) =>
                      setFilters({ ...filters, exact: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="exact"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Exact Matches (100%)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="above90"
                    checked={filters.above90}
                    onCheckedChange={(checked) =>
                      setFilters({ ...filters, above90: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="above90"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Above 90% Match
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="between80and90"
                    checked={filters.between80and90}
                    onCheckedChange={(checked) =>
                      setFilters({
                        ...filters,
                        between80and90: checked as boolean,
                      })
                    }
                  />
                  <label
                    htmlFor="between80and90"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    80% – 90% Matches
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="between60and80"
                    checked={filters.between60and80}
                    onCheckedChange={(checked) =>
                      setFilters({
                        ...filters,
                        between60and80: checked as boolean,
                      })
                    }
                  />
                  <label
                    htmlFor="between60and80"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    60% – 80% Matches
                  </label>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div> */}
        </div>

        <div className="container mx-auto px-10 py-2">
          {/* Applicants Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border border-border/50">
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
                {applications.length === 0
                  ? "No one has applied to this internship yet."
                  : "No applicants match the selected filters."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApplications
                  .slice(0, displayCount)
                  .map((application) => {
                    const skills = safeParse(
                      application.studentProfile?.skills,
                      []
                    );
                    const displaySkills = skills
                      .slice(0, 3)
                      .map((s: any) =>
                        typeof s === "string" ? s : s.name || s
                      );
                    const matchScore = application.profile_match_score || 0;
                    const daysAgo = getDaysAgo(application.applied_date);

                    return (
                      <Card
                        key={application.id}
                        className="border border-border/50 hover:shadow-lg transition-shadow w-full max-w-s min-h-[300px] rounded-3xl"
                      >
                        <CardContent className="p-8 space-y-5">
                          {/* Header Section */}
                          <div className="flex items-center gap-5">
                            {/* Avatar with colored ring based on match score */}
                            <div className="relative flex-shrink-0">
                              <Avatar
                                className={`w-20 h-20 ring-4 ${getMatchColor(
                                  matchScore
                                )}`}
                              >
                                <AvatarImage
                                  src={
                                    application.studentProfile?.avatar_url ||
                                    undefined
                                  }
                                  alt={application.profile.full_name}
                                />
                                <AvatarFallback className="text-lg font-semibold">
                                  {application.profile.full_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {/* Status Badge */}
                              <div className="absolute -top-2 -right-2">
                                {getStatusBadge(application.status)}
                              </div>
                            </div>

                            {/* Name, Role, and Days Ago */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1 text-gray-900">
                                {application.profile.full_name}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {application.internship.title}
                              </p>
                              <Badge className="bg-yellow-500 text-white hover:bg-yellow-500">
                                Applied {daysAgo}{" "}
                                {daysAgo === 1 ? "day" : "days"} ago
                              </Badge>
                            </div>
                          </div>

                          {/* Bio */}
                          <p className="text-base text-gray-700 leading-relaxed">
                            {typeof application.studentProfile?.bio === "string"
                              ? application.studentProfile.bio
                              : Array.isArray(application.studentProfile?.bio)
                              ? application.studentProfile.bio.join(" ")
                              : "Passionate UI/UX designer with 3+ years of experience creating user-centered digital experiences."}
                          </p>

                          {/* Skills (Single Line) */}
                          <div className="min-h-7">
                            {skills.length > 0 && (
                              <div className="flex gap-2 overflow-hidden">
                                {skills.length > 2 ? (
                                  <>
                                    {skills.slice(0, 2).map((skill, i) => (
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
                                      +{skills.length - 2}
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
                          </div>

                          {/* Divider */}
                          <div className="border-t border-border/40"></div>

                          {/* View Profile Button */}
                          <Button
                            variant="outline"
                            size="lg"
                            className="w-full border-2 border-teal-500 text-teal-600 hover:bg-teal-50 text-sm py-3 rounded-full mt-4"
                            onClick={() =>
                              navigate(`/candidate/${application.id}`)
                            }
                          >
                            View Profile
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>

              {/* Infinite Scroll Target */}
              {displayCount < filteredApplications.length && (
                <div
                  ref={observerTarget}
                  className="flex justify-center mt-8 py-4"
                >
                  <Button variant="link" className="text-primary font-medium">
                    View More
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
