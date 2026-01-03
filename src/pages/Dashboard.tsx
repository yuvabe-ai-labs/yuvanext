import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  BookmarkCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getRemommendedInternships,
  getSavedInternships,
  getAppliedInternships,
} from "@/services/internships.service";
import { getCourses } from "@/services/courses.service";
import type {
  Internship,
  SavedInternships,
  AppliedInternships,
} from "@/types/internships.types";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  formatDistanceToNow,
} from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();

  const [currentInternshipIndex, setCurrentInternshipIndex] = useState(0);
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
  const [activityView, setActivityView] = useState<"saved" | "applied">(
    "saved"
  );
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  // Data states
  const [recommendedInternships, setRecommendedInternships] = useState<
    Internship[]
  >([]);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [savedInternships, setSavedInternships] = useState<SavedInternships[]>(
    []
  );
  const [appliedInternships, setAppliedInternships] = useState<
    AppliedInternships[]
  >([]);

  // Loading states
  const [internshipsLoading, setInternshipsLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(true);
  const [appliedLoading, setAppliedLoading] = useState(true);

  // Fetch recommended internships
  useEffect(() => {
    const fetchRecommendedInternships = async () => {
      try {
        setInternshipsLoading(true);
        const data = await getRemommendedInternships();
        setRecommendedInternships(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching recommended internships:", error);
        setRecommendedInternships([]);
      } finally {
        setInternshipsLoading(false);
      }
    };
    fetchRecommendedInternships();
  }, []);

  // Fetch recommended courses
  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      try {
        setCoursesLoading(true);
        const data = await getCourses();
        setRecommendedCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching recommended courses:", error);
        setRecommendedCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchRecommendedCourses();
  }, []);

  // Fetch saved internships
  useEffect(() => {
    const fetchSavedInternships = async () => {
      try {
        setSavedLoading(true);
        const data = await getSavedInternships();
        setSavedInternships(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching saved internships:", error);
        setSavedInternships([]);
      } finally {
        setSavedLoading(false);
      }
    };
    fetchSavedInternships();
  }, []);

  // Fetch applied internships
  useEffect(() => {
    const fetchAppliedInternships = async () => {
      try {
        setAppliedLoading(true);
        const data = await getAppliedInternships();
        setAppliedInternships(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching applied internships:", error);
        setAppliedInternships([]);
      } finally {
        setAppliedLoading(false);
      }
    };
    fetchAppliedInternships();
  }, []);

  const nextActivity = (activities: any[]) => {
    setCurrentActivityIndex((prev) =>
      prev + 3 >= activities.length ? 0 : prev + 3
    );
  };

  const prevActivity = (activities: any[]) => {
    setCurrentActivityIndex((prev) =>
      prev === 0 ? Math.max(activities.length - 3, 0) : prev - 3
    );
  };

  const nextInternship = () => {
    setCurrentInternshipIndex((prev) =>
      prev === recommendedInternships.length - 1 ? 0 : prev + 1
    );
  };

  const prevInternship = () => {
    setCurrentInternshipIndex((prev) =>
      prev === 0 ? recommendedInternships.length - 1 : prev - 1
    );
  };

  const nextCourse = () => {
    setCurrentCourseIndex((prev) =>
      prev === recommendedCourses.length - 1 ? 0 : prev + 1
    );
  };

  const prevCourse = () => {
    setCurrentCourseIndex((prev) =>
      prev === 0 ? recommendedCourses.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 sm:px-6 lg:px-[7.5rem] py-4 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2.5">
          {/* Main Content */}
          <div
            className="lg:col-span-4 space-y-2.5 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2"
            style={{ scrollbarWidth: "thin" }}
          >
            {/* Recommended Internships */}
            <section>
              <Card className="p-6 bg-white shadow-sm md:border md:border-gray-200 rounded-3xl">
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
                ) : recommendedInternships.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No recommended internships available at the moment.
                  </p>
                ) : (
                  <div className="relative">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={prevInternship}
                        className="flex-shrink-0 rounded-full hidden sm:flex w-7 h-7"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      <div className="flex-1 flex overflow-x-auto gap-2.5 snap-x snap-mandatory sm:grid sm:grid-cols-2 md:grid-cols-3 [&::-webkit-scrollbar]:w-0 px-1">
                        {recommendedInternships
                          .slice(0, 6)
                          .slice(
                            currentInternshipIndex,
                            currentInternshipIndex + 3
                          )
                          .map((internship, idx) => {
                            if (!internship) return null;

                            const colors = [
                              "bg-[#F4FFD5] border-[#AAD23C]",
                              "bg-[#E8EFFF] border-[#5A80D8]",
                              "bg-[#DAC8FF] border-[#7752C5]",
                            ];
                            const colorClass = colors[idx % colors.length];
                            const initial =
                              internship.companyName?.charAt(0) || "C";
                            const daysAgo = Math.floor(
                              (Date.now() -
                                new Date(internship.createdAt).getTime()) /
                                (1000 * 60 * 60 * 24)
                            );
                            const timeText =
                              daysAgo === 0
                                ? "Today"
                                : daysAgo === 1
                                ? "1d ago"
                                : `${daysAgo}d ago`;

                            return (
                              <Card
                                key={internship.id}
                                className={`${colorClass} shadow-sm hover:shadow-md transition-shadow cursor-pointer rounded-xl min-w-[60vw] snap-center md:w-auto md:min-w-0 lg:flex-1`}
                                onClick={() =>
                                  navigate(
                                    `/recommended-internships?id=${internship.id}`
                                  )
                                }
                              >
                                <CardHeader className="pb-2.5">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center text-background font-bold text-sm">
                                      {internship.companyLogo ? (
                                        <img
                                          src={internship.companyLogo}
                                          alt={internship.companyName}
                                          className="w-full h-full rounded-full object-cover"
                                        />
                                      ) : (
                                        initial
                                      )}
                                    </div>
                                    <Badge className="text-xs bg-transparent hover:bg-transparent text-gray-600">
                                      {timeText}
                                    </Badge>
                                  </div>
                                  <CardTitle className="m-0 text-gray-800 text-base font-normal flex justify-between items-center">
                                    {internship.title &&
                                    internship.title.length > 17
                                      ? `${internship.title.slice(0, 18)}...`
                                      : internship.title}
                                    <ChevronRight className="w-5 h-5" />
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
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
                        onClick={nextInternship}
                        className="flex-shrink-0 rounded-full hidden sm:flex w-7 h-7"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </section>

            {/* Certified Courses */}
            <section>
              <Card className="p-6 bg-white shadow-sm md:border-gray-200 rounded-3xl">
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

                {coursesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : recommendedCourses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No courses available at the moment.
                  </p>
                ) : (
                  <div className="relative">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={prevCourse}
                        className="flex-shrink-0 rounded-full hidden sm:flex w-7 h-7"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 flex overflow-x-auto gap-2.5 snap-x snap-mandatory sm:grid sm:grid-cols-2 md:grid-cols-3 [&::-webkit-scrollbar]:w-0 px-1">
                        {recommendedCourses
                          .slice(currentCourseIndex, currentCourseIndex + 3)
                          .map((course, idx) => {
                            if (!course) return null;

                            const gradients = [
                              "bg-gradient-to-br from-blue-900 to-purple-900",
                              "bg-gradient-to-br from-purple-800 to-orange-600",
                              "bg-gradient-to-br from-cyan-500 to-blue-600",
                            ];
                            const gradientClass =
                              gradients[idx % gradients.length];

                            return (
                              <Card
                                key={course.id}
                                className="overflow-hidden rounded-3xl hover:shadow-lg transition-all min-w-[60vw] snap-center md:w-auto md:min-w-0 lg:flex-1"
                                onClick={() => navigate("/courses")}
                              >
                                <div
                                  className={`h-32 relative ${gradientClass} max-h-28 flex items-center justify-center`}
                                >
                                  {course.imageUrl ? (
                                    <img
                                      src={course.imageUrl}
                                      alt={course.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="text-white text-center">
                                      <h3 className="text-2xl font-bold">
                                        {course.category || "Course"}
                                      </h3>
                                    </div>
                                  )}
                                  {course.createdAt ? (
                                    <Badge className="absolute top-3 right-3 bg-white/90 text-foreground hover:bg-white">
                                      {formatDistanceToNow(
                                        new Date(course.createdAt),
                                        {
                                          addSuffix: true,
                                        }
                                      )}
                                    </Badge>
                                  ) : (
                                    <Badge className="absolute top-3 right-3 bg-white/90 text-foreground hover:bg-white">
                                      New
                                    </Badge>
                                  )}
                                </div>

                                <CardContent className="px-5 py-2.5 space-y-2">
                                  <h3 className="font-medium text-base line-clamp-2">
                                    {course.title
                                      ? course.title.length > 20
                                        ? `${course.title.slice(0, 18)}...`
                                        : course.title
                                      : "Course Title"}
                                  </h3>

                                  <div className="flex items-center justify-between">
                                    <div className="flex m-0 items-center gap-1 text-sm text-muted-foreground">
                                      <Clock className="w-4 h-4" />
                                      <span>
                                        {course.duration || "8 weeks"}
                                      </span>
                                    </div>
                                  </div>

                                  <button className="border-none flex gap-1 items-center p-0 m-0 text-sm text-primary hover:bg-transparent hover:text-primary">
                                    Know more
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={nextCourse}
                        className="flex-shrink-0 rounded-full hidden sm:flex w-7 h-7"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </section>

            {/* Your Activity Section */}
            <section>
              <Card className="p-6 bg-white shadow-sm md:border md:border-gray-200 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Your Activity</h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setActivityView("saved")}
                      className={`rounded-full bg-transparent ${
                        activityView === "saved"
                          ? "text-gray-600 underline underline-offset-8"
                          : "text-gray-400"
                      }`}
                    >
                      Saved
                    </Button>
                    <Button
                      onClick={() => setActivityView("applied")}
                      className={`rounded-full bg-transparent ${
                        activityView === "applied"
                          ? "text-gray-600 underline underline-offset-8"
                          : "text-gray-400"
                      }`}
                    >
                      Applied
                    </Button>
                  </div>
                </div>

                {(activityView === "saved" ? savedLoading : appliedLoading) ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (activityView === "saved"
                    ? savedInternships
                    : appliedInternships
                  ).length === 0 ? (
                  <div className="text-center py-12">
                    <BookmarkCheck className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No {activityView} internships yet
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          prevActivity(
                            activityView === "saved"
                              ? savedInternships
                              : appliedInternships
                          )
                        }
                        className="flex-shrink-0 rounded-full hidden sm:flex w-7 h-7"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      <div className="flex overflow-x-auto snap-x snap-mandatory sm:grid sm:grid-cols-2 gap-2.5 md:grid-cols-3 px-1 [&::-webkit-scrollbar]:w-0">
                        {(activityView === "saved"
                          ? savedInternships
                          : appliedInternships
                        )
                          .slice(currentActivityIndex, currentActivityIndex + 3)
                          .map((internship) => {
                            const dateToUse =
                              activityView === "saved"
                                ? internship.savedAt || internship.createdAt
                                : internship.appliedAt || internship.createdAt;

                            const getShortTimeAgo = (date: string | Date) => {
                              const now = new Date();
                              const past = new Date(date);

                              const days = differenceInDays(now, past);
                              if (days > 0) return `${days}d`;

                              const hours = differenceInHours(now, past);
                              if (hours > 0) return `${hours}h`;

                              const minutes = differenceInMinutes(now, past);
                              if (minutes > 0) return `${minutes}m`;

                              return "just now";
                            };

                            const timeAgo = getShortTimeAgo(dateToUse);

                            return (
                              <Card
                                key={internship.id}
                                className="px-5 py-4 hover:shadow-lg transition-all cursor-pointer rounded-xl border border-gray-300 min-w-[60vw] sm:min-w-0 sm:w-full"
                                onClick={() =>
                                  navigate(
                                    `/internships/${internship.internshipId}`
                                  )
                                }
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between">
                                    <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center text-background font-bold">
                                      {internship.companyLogo ? (
                                        <img
                                          src={internship.companyLogo}
                                          alt={internship.companyName}
                                          className="w-full h-full rounded-full object-cover"
                                        />
                                      ) : (
                                        internship.companyName?.charAt(0) || "C"
                                      )}
                                    </div>
                                    <Badge className="bg-primary text-primary-foreground">
                                      {activityView === "saved"
                                        ? "Saved"
                                        : "Applied"}{" "}
                                      {`${timeAgo} ago`}
                                    </Badge>
                                  </div>

                                  <h3 className="text-4 font-semibold text-gray-900 line-clamp-1">
                                    {internship.internshipTitle || "Untitled"}
                                  </h3>

                                  <p className="text-sm text-gray-500 line-clamp-3">
                                    {internship.internshipDescription ||
                                      "No description available"}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      <span>
                                        {internship.duration || "Not specified"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          nextActivity(
                            activityView === "saved"
                              ? savedInternships
                              : appliedInternships
                          )
                        }
                        className="flex-shrink-0 rounded-full hidden sm:flex w-7 h-7"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
