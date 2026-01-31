import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import {
  useRemommendedInternships,
  useSavedInternships,
  useAppliedInternships,
} from "@/hooks/useInternships";
import { useCourses } from "@/hooks/useCourses";
import type {
  Internship,
  SavedInternships,
  AppliedInternships,
} from "@/types/internships.types";
import type { Course } from "@/types/courses.types";
import ProfileSidebar from "@/components/ProfileSidebar";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activityView, setActivityView] = useState<"saved" | "applied">(
    "saved",
  );

  // Refs for smooth scroll control
  const internshipScrollRef = useRef<HTMLDivElement>(null);
  const courseScrollRef = useRef<HTMLDivElement>(null);
  const activityScrollRef = useRef<HTMLDivElement>(null);

  // Fetch data
  const { data: internshipsData, isLoading: internshipsLoading } =
    useRemommendedInternships();
  const { data: coursesData } = useCourses();
  const { data: savedData } = useSavedInternships();
  const { data: appliedData } = useAppliedInternships();

  const recommendedInternships: Internship[] = Array.isArray(internshipsData)
    ? internshipsData
    : [];
  const recommendedCourses: Course[] = Array.isArray(coursesData)
    ? coursesData
    : [];
  const savedInternships: SavedInternships[] = Array.isArray(savedData)
    ? savedData
    : [];
  const appliedInternships: AppliedInternships[] = Array.isArray(appliedData)
    ? appliedData
    : [];

  // Updated Scroll handler to move exactly one card
  const scroll = (
    ref: React.RefObject<HTMLDivElement>,
    direction: "left" | "right",
  ) => {
    if (ref.current) {
      const container = ref.current;
      // Find the first child (the card) to determine width
      const firstCard = container.firstElementChild as HTMLElement;

      if (firstCard) {
        const cardWidth = firstCard.offsetWidth;
        const gap = 16; // This matches your 'gap-4' (4 * 4px)
        const scrollAmount = cardWidth + gap;

        const scrollTo =
          direction === "left"
            ? container.scrollLeft - scrollAmount
            : container.scrollLeft + scrollAmount;

        container.scrollTo({ left: scrollTo, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 sm:px-6 lg:px-[7.5rem] py-4 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2.5">
          {/* Left Sidebar */}
          <div className="hidden md:block lg:col-span-1 mb-4 lg:mb-0">
            <div className="lg:sticky lg:top-8">
              <ProfileSidebar savedCount={savedInternships.length} />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-2.5 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2 scrollbar-none">
            {/* Recommended Internships */}
            <section>
              <Card className="p-6 px-10 bg-white shadow-sm md:border md:border-gray-200 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Recommended for you</h2>
                  <Button
                    variant="link"
                    className="text-primary p-0 h-auto"
                    onClick={() => navigate("/recommended-internships")}
                  >
                    View all
                  </Button>
                </div>

                {internshipsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="relative group">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => scroll(internshipScrollRef, "left")}
                      className="absolute -left-7 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white shadow-md w-6 h-6 flex items-center justify-center"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </Button>

                    <div
                      ref={internshipScrollRef}
                      className="flex overflow-x-auto gap-4 snap-x snap-mandatory scroll-smooth scrollbar-none pb-4"
                    >
                      {recommendedInternships.map((internship, idx) => {
                        const colors = [
                          "bg-[#F4FFD5] border-[#AAD23C]",
                          "bg-[#E8EFFF] border-[#5A80D8]",
                          "bg-[#DAC8FF] border-[#7752C5]",
                        ];
                        const daysAgo = Math.floor(
                          (Date.now() -
                            new Date(internship.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24),
                        );

                        return (
                          <Card
                            key={internship.id}
                            className={`${colors[idx % colors.length]} flex-shrink-0 w-[85%] md:w-[calc(40%-16px)] snap-start shadow-sm hover:shadow-md transition-shadow cursor-pointer rounded-xl`}
                            onClick={() =>
                              navigate(`/internships/${internship.id}`)
                            }
                          >
                            <CardHeader className="pb-2.5">
                              <div className="flex justify-between items-start mb-2">
                                <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center text-background font-bold text-sm overflow-hidden">
                                  {internship.createdBy?.avatarUrl ? (
                                    <img
                                      src={internship.createdBy.avatarUrl}
                                      alt=""
                                    />
                                  ) : (
                                    internship.createdBy?.name?.charAt(0)
                                  )}
                                </div>
                                <Badge className="text-xs bg-transparent text-gray-600">
                                  {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
                                </Badge>
                              </div>
                              <CardTitle className="text-base font-normal flex justify-between items-center">
                                {internship.title?.length > 17
                                  ? `${internship.title.slice(0, 18)}...`
                                  : internship.title}
                                <ChevronRight className="w-5 h-5" />
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center space-x-1 text-xs text-gray-600">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {internship.duration || "Not specified"}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => scroll(internshipScrollRef, "right")}
                      className="absolute -right-7 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white shadow-md w-6 h-6 flex items-center justify-center"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </Card>
            </section>

            {/* Certified Courses */}
            <section>
              <Card className="p-6 px-8 bg-white shadow-sm md:border-gray-200 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    Certified Courses for you
                  </h2>
                  <Button
                    variant="link"
                    className="text-primary p-0 h-auto"
                    onClick={() => navigate("/courses")}
                  >
                    View all
                  </Button>
                </div>

                <div className="relative group">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scroll(courseScrollRef, "left")}
                    className="absolute -left-7 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white w-6 h-6 flex items-center justify-center"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </Button>

                  <div
                    ref={courseScrollRef}
                    className="flex overflow-x-auto gap-4 snap-x snap-mandatory scroll-smooth scrollbar-none pb-4"
                  >
                    {recommendedCourses.map((course, idx) => {
                      const gradients = [
                        "bg-gradient-to-br from-blue-900 to-purple-900",
                        "bg-gradient-to-br from-purple-800 to-orange-600",
                        "bg-gradient-to-br from-cyan-500 to-blue-600",
                      ];
                      return (
                        <Card
                          key={course.id}
                          className="flex-shrink-0 w-[85%] md:w-[calc(40%-16px)] snap-start overflow-hidden rounded-3xl hover:shadow-lg transition-all"
                          onClick={() => navigate("/courses")}
                        >
                          <div
                            className={`h-28 relative ${gradients[idx % gradients.length]} flex items-center justify-center overflow-hidden`}
                          >
                            {course.bannerUrl ? (
                              <img
                                src={course.bannerUrl}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : (
                              <h3 className="text-white text-xl font-bold">
                                {course.category || "Course"}
                              </h3>
                            )}
                          </div>
                          <CardContent className="p-4 space-y-2">
                            <h3 className="font-medium text-base line-clamp-1">
                              {course.title}
                            </h3>
                            <div className="flex items-center justify-between text-muted-foreground text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {course.duration || "8 weeks"}
                              </div>
                            </div>
                            <button
                              className="flex gap-1 items-center text-sm text-primary hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (course.redirectUrl) {
                                  window.open(course.redirectUrl, "_blank");
                                }
                              }}
                            >
                              Know more <ChevronRight className="w-4 h-4" />
                            </button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scroll(courseScrollRef, "right")}
                    className="absolute -right-7 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white w-6 h-6 flex items-center justify-center"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            </section>

            {/* Your Activity */}
            <section>
              <Card className="p-6 px-8 bg-white shadow-sm md:border md:border-gray-200 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Your Activity</h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setActivityView("saved")}
                      className={`rounded-full bg-transparent hover:bg-transparent ${activityView === "saved" ? "text-gray-600 underline underline-offset-8" : "text-gray-400"}`}
                    >
                      Saved
                    </Button>
                    <Button
                      onClick={() => setActivityView("applied")}
                      className={`rounded-full bg-transparent hover:bg-transparent ${activityView === "applied" ? "text-gray-600 underline underline-offset-8" : "text-gray-400"}`}
                    >
                      Applied
                    </Button>
                  </div>
                </div>

                <div className="relative group">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scroll(activityScrollRef, "left")}
                    className="absolute -left-7 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white w-6 h-6 flex items-center justify-center"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </Button>

                  <div
                    ref={activityScrollRef}
                    className="flex overflow-x-auto gap-4 snap-x snap-mandatory scroll-smooth scrollbar-none pb-4"
                  >
                    {(activityView === "saved"
                      ? savedInternships
                      : appliedInternships
                    ).map((internship) => (
                      <Card
                        key={internship.id}
                        className="flex-shrink-0 w-[85%] md:w-[calc(40%-16px)] snap-start px-5 py-4 hover:shadow-lg transition-all cursor-pointer rounded-xl border border-gray-300"
                        onClick={() =>
                          navigate(`/internships/${internship.internshipId}`)
                        }
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center text-background font-bold text-sm overflow-hidden">
                              {internship.createdBy?.avatarUrl ? (
                                <img
                                  src={internship.createdBy.avatarUrl}
                                  alt=""
                                />
                              ) : (
                                internship.createdBy?.name?.charAt(0)
                              )}
                            </div>
                            <Badge className="bg-primary text-primary-foreground text-xs">
                              {activityView === "saved" ? "Saved" : "Applied"}
                            </Badge>
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                            {internship.internshipTitle || "Untitled"}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {internship.internshipDescription ||
                              "No description available"}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scroll(activityScrollRef, "right")}
                    className="absolute -right-7 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white w-6 h-6 flex items-center justify-center"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
