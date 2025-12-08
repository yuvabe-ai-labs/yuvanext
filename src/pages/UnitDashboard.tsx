import CreateInternshipDialog from "@/components/CreateInternshipDialog";
import EditInternshipDialog from "@/components/EditInternshipDialog";
import InternshipDetailsView from "@/components/InternshipDetailsView";
import Navbar from "@/components/Navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInternships } from "@/hooks/useInternships";
import { useUnitApplications } from "@/hooks/useUnitApplications";
import { useUnitReports } from "@/hooks/useUnitReports";
import { useHiredApplicants } from "@/hooks/useHiredApplicants";
import { useStudentTasks } from "@/hooks/useStudentTasks";
import { calculateOverallTaskProgress } from "@/utils/taskProgress";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle,
  EllipsisIcon,
  Eye,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const safeParse = (data: any, fallback: any) => {
  if (!data) return fallback;
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return fallback;
  }
};

// Component to display task progress for each candidate
const CandidateTaskProgress = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const { data: tasksData } = useStudentTasks(applicationId);
  const tasks = tasksData?.data || [];
  const taskProgress = calculateOverallTaskProgress(tasks);

  // Get internship start and end dates
  const getInternshipDates = () => {
    if (tasks.length === 0) return { startDate: null, endDate: null };

    const dates = tasks
      .filter((task) => task.start_date && task.end_date)
      .flatMap((task) => [new Date(task.start_date), new Date(task.end_date)]);

    if (dates.length === 0) return { startDate: null, endDate: null };

    const startDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const endDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    return { startDate, endDate };
  };

  const { startDate, endDate } = getInternshipDates();

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          Project Progress
        </span>
        <span className="text-sm font-semibold text-gray-800">
          {taskProgress}%
        </span>
      </div>

      {/* Progress Bar (thicker h-4) */}
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${taskProgress}%` }}
        />
      </div>

      {/* Dates */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          Started: {startDate ? format(startDate, "dd/MM/yyyy") : "Not started"}
        </span>
        <span>
          Ends: {endDate ? format(endDate, "dd/MM/yyyy") : "No end date"}
        </span>
      </div>
    </div>
  );
};

const UnitDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("applications");
  const { applications, stats, loading } = useUnitApplications();
  const { internships, loading: internshipsLoading } = useInternships();
  const {
    data: hiredCandidates,
    unitInfo,
    loading: hiredLoading,
  } = useHiredApplicants();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [jobFilter, setJobFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedInternship, setSelectedInternship] = useState<any>(null);
  const [editingInternship, setEditingInternship] = useState<any>(null);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [deletingInternship, setDeletingInternship] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activatingInternship, setActivatingInternship] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    weeklyData,
    monthlyData,
    stats: reportStats,
    loading: reportsLoading,
  } = useUnitReports();

  // Auto-close internships when deadline passes
  useEffect(() => {
    const checkAndCloseExpiredInternships = async () => {
      if (internshipsLoading || internships.length === 0) return;

      const now = new Date();
      const expiredInternships = internships.filter((internship) => {
        if (internship.status !== "active") return false;
        const deadline = new Date(internship.application_deadline);
        return deadline < now;
      });

      if (expiredInternships.length > 0) {
        try {
          const updatePromises = expiredInternships.map((internship) =>
            supabase
              .from("internships")
              .update({ status: "closed" })
              .eq("id", internship.id)
          );

          await Promise.all(updatePromises);
          window.location.reload();
        } catch (err) {
          console.error("Error auto-closing expired internships:", err);
        }
      }
    };

    checkAndCloseExpiredInternships();
  }, [internships, internshipsLoading]);

  if (selectedInternship) {
    return (
      <InternshipDetailsView
        internship={selectedInternship}
        onClose={() => setSelectedInternship(null)}
      />
    );
  }

  const filteredApplications = applications.filter((application) => {
    if (filterStatuses.length === 0) return true;
    return filterStatuses.includes(application.status);
  });

  // Filter hired candidates by search query
  const filteredHiredCandidates = hiredCandidates.filter((candidate) => {
    if (!searchQuery) return true;
    const name = candidate.student?.full_name?.toLowerCase() || "";
    const internshipTitle = candidate.internship?.title?.toLowerCase() || "";
    return (
      name.includes(searchQuery.toLowerCase()) ||
      internshipTitle.includes(searchQuery.toLowerCase())
    );
  });

  const handleInternshipCreated = () => {
    window.location.reload();
  };

  const handleViewDetails = (internshipId: string) => {
    const internship = internships.find((i) => i.id === internshipId);
    if (internship) {
      setSelectedInternship(internship);
    }
  };

  const handleAddComments = (internshipId: string) => {
    const internship = internships.find((i) => i.id === internshipId);
    if (internship) {
      setEditingInternship(internship);
    }
  };

  const handleDeleteClick = (internship: any) => {
    setDeletingInternship(internship);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingInternship) return;

    try {
      setUpdating(deletingInternship.id);

      const { error: deleteError } = await supabase
        .from("internships")
        .delete()
        .eq("id", deletingInternship.id);

      if (deleteError) throw deleteError;

      setShowDeleteDialog(false);
      setDeletingInternship(null);
      window.location.reload();
    } catch (err: any) {
      console.error("Error deleting job:", err);
      alert("Failed to delete job description");
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleStatus = async (internship: any) => {
    if (internship.status !== "active") {
      setActivatingInternship(internship);
      setEditingInternship(internship);
    } else {
      try {
        setUpdating(internship.id);

        const { error: updateError } = await supabase
          .from("internships")
          .update({ status: "closed" })
          .eq("id", internship.id);

        if (updateError) throw updateError;

        window.location.reload();
      } catch (err: any) {
        console.error("Error updating job status:", err);
        alert("Failed to update job status");
      } finally {
        setUpdating(null);
      }
    }
  };

  const handleEditSuccess = async () => {
    if (activatingInternship) {
      try {
        const { error: updateError } = await supabase
          .from("internships")
          .update({ status: "active" })
          .eq("id", activatingInternship.id);

        if (updateError) throw updateError;

        setActivatingInternship(null);
        setEditingInternship(null);
        window.location.reload();
      } catch (err: any) {
        console.error("Error activating job:", err);
        alert("Failed to activate job description");
        setActivatingInternship(null);
        setEditingInternship(null);
      }
    } else {
      setEditingInternship(null);
      window.location.reload();
    }
  };

  const handleEditClose = () => {
    setActivatingInternship(null);
    setEditingInternship(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "bg-green-500 text-white hover:bg-green-500";
      case "rejected":
        return "bg-red-500 text-white hover:bg-red-500";
      case "interviewed":
        return "bg-blue-500 text-white hover:bg-blue-500";
      case "hired":
        return "bg-green-500 text-white hover:bg-green-500";
      default:
        return "bg-gray-500 text-white hover:bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "Shortlisted";
      case "rejected":
        return "Not Shortlist";
      case "interviewed":
        return "Interviewed";
      case "hired":
        return "hired";
      default:
        return "Applied";
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const toggleStatusFilter = (status: string) => {
    setFilterStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const getFilterDisplayText = () => {
    if (filterStatuses.length === 0) return "All Applications";
    if (filterStatuses.length === 1) {
      const statusLabels: { [key: string]: string } = {
        shortlisted: "Shortlisted",
        interviewed: "Interviewed",
        rejected: "Rejected",
        hired: "Hired",
      };
      return statusLabels[filterStatuses[0]] || "Select Filter";
    }
    return `${filterStatuses.length} selected`;
  };

  const formatJobType = (jobType: string) => {
    if (!jobType) return "Not specified";
    return jobType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleViewCandidate = (applicationId: string) => {
    navigate(`/unit/candidate-tasks/${applicationId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container px-4 sm:px-6 lg:px-[7.5rem] py-4 lg:py-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="rounded-2xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium">
                    Total Applications
                  </p>
                  {loading ? (
                    <Skeleton className="h-8 sm:h-10 w-12 sm:w-16 my-1" />
                  ) : (
                    <>
                      <p className="text-2xl sm:text-3xl font-bold">
                        {stats.total}
                      </p>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </>
                  )}
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium ">
                    Total Job Descriptions
                  </p>
                  {loading ? (
                    <Skeleton className="h-8 sm:h-10 w-12 sm:w-16 my-1" />
                  ) : (
                    <>
                      <p className="text-2xl sm:text-3xl font-bold">
                        {stats.totalJobs}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Active & Closed
                      </p>
                    </>
                  )}
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium ">
                    Interview Scheduled
                  </p>
                  {loading ? (
                    <Skeleton className="h-8 sm:h-10 w-12 sm:w-16 my-1" />
                  ) : (
                    <>
                      <p className="text-2xl sm:text-3xl font-bold">
                        {stats.interviews}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Candidates
                      </p>
                    </>
                  )}
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium ">
                    Hired This Month
                  </p>
                  {loading ? (
                    <Skeleton className="h-8 sm:h-10 w-12 sm:w-16 my-1" />
                  ) : (
                    <>
                      <p className="text-2xl sm:text-3xl font-bold">
                        {stats.hiredThisMonth}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date().toLocaleString("default", {
                          month: "long",
                        })}
                      </p>
                    </>
                  )}
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4 sm:space-y-6"
        >
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="grid w-full min-w-max sm:min-w-0 grid-cols-4 bg-gray-100/70 backdrop-blur-sm rounded-3xl border border-gray-200 h-12 sm:h-16 shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)]">
              <TabsTrigger
                value="applications"
                className="rounded-3xl px-3 sm:px-5 py-2 sm:py-4 text-xs sm:text-sm font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all duration-200 whitespace-nowrap"
              >
                Applications
              </TabsTrigger>
              <TabsTrigger
                value="job-descriptions"
                className="rounded-3xl px-3 sm:px-5 py-2 sm:py-4 text-xs sm:text-sm font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all duration-200 whitespace-nowrap"
              >
                Job Descriptions
              </TabsTrigger>
              <TabsTrigger
                value="candidates"
                className="rounded-3xl px-3 sm:px-5 py-2 sm:py-4 text-xs sm:text-sm font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all duration-200 whitespace-nowrap"
              >
                Candidates
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="rounded-3xl px-3 sm:px-5 py-2 sm:py-4 text-xs sm:text-sm font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all duration-200 whitespace-nowrap"
              >
                Reports
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Applications Tab */}
          <TabsContent
            value="applications"
            className="px-0 sm:px-4 lg:px-10 py-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-semibold">
                All Applications
              </h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-[200px] justify-between items-center rounded-full"
                  >
                    {/* Left side text */}
                    <span className="truncate">{getFilterDisplayText()}</span>

                    {/* Right side icons */}
                    <div className="flex items-center gap-1">
                      {filterStatuses.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="rounded-full px-2 py-0.5"
                        >
                          {filterStatuses.length}
                        </Badge>
                      )}
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-[220px] rounded-2xl p-2 shadow-md"
                >
                  {[
                    { value: "applied", label: "Applied" },
                    { value: "shortlisted", label: "Shortlisted" },
                    { value: "interviewed", label: "Interviewed" },
                    { value: "rejected", label: "Rejected" },
                    { value: "hired", label: "Hired" },
                  ].map((status) => (
                    <DropdownMenuItem
                      key={status.value}
                      onSelect={(e) => e.preventDefault()}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => toggleStatusFilter(status.value)}
                    >
                      <input
                        type="checkbox"
                        checked={filterStatuses.includes(status.value)}
                        readOnly
                        className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                      />
                      <span>{status.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border border-border/50">
                    <CardContent className="p-4 sm:p-6">
                      <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4" />
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
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-2">
                  {filterStatuses.length === 0
                    ? "No Applications Yet"
                    : "No Applications Found"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {filterStatuses.length === 0
                    ? "Applications for your internships will appear here."
                    : "No applications found with the selected filters."}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredApplications.slice(0, 9).map((application) => {
                    const skills = safeParse(
                      application.studentProfile?.skills,
                      []
                    );
                    const displaySkills = skills
                      .slice(0, 3)
                      .map((s: any) =>
                        typeof s === "string" ? s : s.name || s
                      );

                    return (
                      <Card
                        key={application.id}
                        className="border border-border/50 hover:shadow-lg transition-shadow rounded-3xl"
                      >
                        <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
                          <div className="flex items-center gap-3 sm:gap-5">
                            <div className="relative flex-shrink-0">
                              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-green-500">
                                <AvatarImage
                                  src={
                                    application.studentProfile?.avatar_url ||
                                    undefined
                                  }
                                  alt={application.profile.full_name}
                                />
                                <AvatarFallback className="text-base sm:text-lg font-semibold">
                                  {application.profile.full_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 truncate">
                                {application.profile.full_name}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-2 truncate">
                                {application.internship.title}
                              </p>
                              <Badge
                                className={`${getStatusColor(
                                  application.status
                                )} text-xs sm:text-sm px-2 sm:px-3 py-1`}
                              >
                                {getStatusLabel(application.status)}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-sm sm:text-base text-gray-700 leading-relaxed line-clamp-3">
                            {typeof application.studentProfile?.bio === "string"
                              ? application.studentProfile.bio
                              : Array.isArray(application.studentProfile?.bio)
                              ? application.studentProfile.bio.join(" ")
                              : "Passionate about creating user-centered digital experiences."}
                          </p>

                          <div className="flex gap-2 sm:gap-3 overflow-hidden">
                            {skills.length > 3 ? (
                              <>
                                {skills
                                  .slice(0, 3)
                                  .map((skill: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-[10px] sm:text-[11px] text-gray-600 bg-muted/40 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 whitespace-nowrap flex-shrink-0"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                <Badge
                                  variant="outline"
                                  className="text-[10px] sm:text-[11px] text-gray-600 bg-muted/40 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 whitespace-nowrap flex-shrink-0"
                                >
                                  +{skills.length - 3}
                                </Badge>
                              </>
                            ) : (
                              skills.map((skill: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-[10px] sm:text-[11px] text-gray-600 bg-muted/40 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 whitespace-nowrap flex-shrink-0"
                                >
                                  {skill}
                                </Badge>
                              ))
                            )}
                          </div>
                          <div className="border-t border-border/40"></div>

                          <Button
                            variant="outline"
                            size="lg"
                            className="w-full border-2 border-teal-500 text-teal-600 hover:bg-teal-50 text-sm py-3 rounded-full"
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

                {filteredApplications.length > 0 && (
                  <div className="flex justify-center mt-6 sm:mt-8">
                    <Button
                      variant="outline"
                      className="px-6 sm:px-8"
                      onClick={() => navigate("/all-applications")}
                    >
                      View All
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Job Descriptions Tab */}
          <TabsContent
            value="job-descriptions"
            className="px-0 sm:px-4 lg:px-10 py-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Job Descriptions
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Select value={jobFilter} onValueChange={setJobFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] rounded-full text-gray-400">
                    <SelectValue placeholder="Select Filter" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all">Select Filter</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="bg-teal-600 hover:bg-teal-700 rounded-full w-full sm:w-auto"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New JD
                </Button>
              </div>
            </div>

            {internshipsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 sm:p-6">
                      <Skeleton className="h-6 w-32 mb-4" />
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-10 w-full mt-4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : internships.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-2">
                  No Job Descriptions
                </h3>
                <p className="text-muted-foreground text-sm px-4">
                  Create your first job posting to start receiving applications.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {internships
                    .filter((internship) => {
                      if (jobFilter === "all") return true;
                      if (jobFilter === "active")
                        return internship.status === "active";
                      if (jobFilter === "closed")
                        return internship.status !== "active";
                      return true;
                    })
                    .slice(0, 6)
                    .map((internship) => {
                      const applicationCount = applications.filter(
                        (app) => app.internship_id === internship.id
                      ).length;

                      return (
                        <Card
                          key={internship.id}
                          className="relative rounded-3xl border border-black-50"
                        >
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex items-start justify-between mb-4 sm:mb-6 gap-2">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <h3 className="font-semibold text-base sm:text-lg leading-tight truncate">
                                  {internship.title}
                                </h3>
                                <Badge
                                  className={`${
                                    internship.status === "active"
                                      ? "bg-green-500 text-white hover:bg-green-500"
                                      : "bg-red-500 text-white hover:bg-red-500"
                                  } text-xs px-2 sm:px-3 py-1 whitespace-nowrap flex-shrink-0`}
                                >
                                  {internship.status === "active"
                                    ? "Active"
                                    : "Closed"}
                                </Badge>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 flex-shrink-0"
                                  >
                                    <EllipsisIcon className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setSelectedInternship(internship)
                                    }
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleAddComments(internship.id)
                                    }
                                  >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit JD
                                  </DropdownMenuItem>
                                  {/* <DropdownMenuItem
                                    onClick={() =>
                                      handleToggleStatus(internship)
                                    }
                                  >
                                    {internship.status === "active" ? (
                                      <span className="flex items-center text-red-500">
                                        <Ban className="w-4 h-4 mr-2" />
                                        Close JD
                                      </span>
                                    ) : (
                                      <span className="flex items-center text-green-500">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Activate JD
                                      </span>
                                    )}
                                  </DropdownMenuItem> */}
                                  {internship.status !== "active" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleToggleStatus(internship)
                                      }
                                    >
                                      <span className="flex items-center text-green-500">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Activate JD
                                      </span>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteClick(internship)
                                    }
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete JD
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-muted-foreground">
                                  Applications:
                                </span>
                                <span className="font-medium">
                                  {applicationCount} Applied
                                </span>
                              </div>
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-muted-foreground">
                                  Duration:
                                </span>
                                <span className="font-medium">
                                  {internship.duration || "Not specified"}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-muted-foreground">
                                  Created on:
                                </span>
                                <span className="font-medium">
                                  {new Date(
                                    internship.created_at
                                  ).toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-muted-foreground">
                                  Deadline:
                                </span>
                                <span className="font-medium">
                                  {new Date(
                                    internship.application_deadline
                                  ).toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              className="w-full rounded-full text-sm"
                              onClick={() =>
                                navigate(
                                  `/internship-applicants/${internship.id}`
                                )
                              }
                            >
                              View Applicants
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>

                {internships.length > 6 && (
                  <div className="flex justify-center mt-6 sm:mt-8">
                    <Button variant="link" className="text-primary font-medium">
                      View More
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Candidates Management Tab */}
          <TabsContent
            value="candidates"
            className="space-y-6 px-0 sm:px-4 lg:px-10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Hired Candidates
                {/* ({filteredHiredCandidates.length}) */}
              </h2>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by name or position"
                  className="pl-10 w-full sm:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {hiredLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="border border-gray-200 rounded-3xl">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-20 h-20 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredHiredCandidates.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <Card className="max-w-md w-full mx-4">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      {searchQuery
                        ? "No Results Found"
                        : "No Hired Candidates Yet"}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {searchQuery
                        ? "Try adjusting your search query"
                        : "Hired candidates will appear here once you hire applicants"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredHiredCandidates.map((candidate) => (
                  <Card
                    key={candidate.application_id}
                    className="border border-gray-200 rounded-3xl hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-3">
                            {candidate.internship?.title ||
                              "Position not specified"}
                          </p>

                          <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <Avatar className="w-20 h-20">
                              <AvatarImage
                                src={candidate.student?.avatar_url || undefined}
                                alt={
                                  candidate.student?.full_name || "Candidate"
                                }
                                className="object-cover"
                              />
                              <AvatarFallback className="text-lg font-semibold bg-gray-200">
                                {(candidate.student?.full_name || "NA")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            {/* Name */}
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {candidate.student?.full_name ||
                                  "Name not available"}
                              </h3>
                            </div>
                          </div>
                        </div>

                        {/* Duration Info */}
                        <div className="text-right text-sm text-gray-600">
                          <span>
                            {candidate.internship?.duration ||
                              "Duration not specified"}{" "}
                            |{" "}
                            {formatJobType(
                              candidate.internship?.job_type || ""
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Task Progress */}
                      <CandidateTaskProgress
                        applicationId={candidate.application_id}
                      />

                      {/* Action */}
                      <div className="flex justify-end pt-2">
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() =>
                            handleViewCandidate(candidate.application_id)
                          }
                        >
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="px-0 sm:px-4 lg:px-10 py-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Reports for this Month
              </h2>
            </div>

            <Card className="rounded-2xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-base sm:text-2xl font-semibold">
                    Weekly Applications
                  </h3>
                  <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-2 rounded-full bg-cyan-300"></div>
                      <span className="text-gray-600">Previous Week</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-2 rounded-full bg-teal-600"></div>
                      <span className="text-gray-600">This Week</span>
                    </div>
                  </div>
                </div>

                {reportsLoading ? (
                  <div className="h-[300px] sm:h-[400px] w-full">
                    {/* Grid lines skeleton */}
                    <div className="h-full w-full relative">
                      {/* Horizontal grid lines */}
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-full border-t border-gray-200"
                          style={{ top: `${(i + 1) * 20}%` }}
                        />
                      ))}

                      {/* Bar chart skeleton */}
                      <div className="absolute bottom-0 left-0 right-0 h-[85%] flex items-end justify-around px-8">
                        {/* 7 days of the week */}
                        {[20, 10, 5, 45, 8, 15, 12].map((height, i) => (
                          <div
                            key={i}
                            className="flex flex-col items-center gap-2 flex-1"
                          >
                            {/* Bar */}
                            <Skeleton
                              className="w-8 sm:w-10 rounded-t-2xl"
                              style={{ height: `${height}%` }}
                            />
                            {/* Day label */}
                            <Skeleton className="h-3 w-8" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      previousWeek: {
                        label: "Previous Week",
                        color: "hsl(187, 71%, 66%)",
                      },
                      thisWeek: {
                        label: "This Week",
                        color: "hsl(173, 58%, 39%)",
                      },
                    }}
                    className="h-[300px] sm:h-[400px] w-full"
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={weeklyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          vertical={false}
                          strokeDasharray="0"
                          stroke="#DDDDDF"
                        />
                        <XAxis
                          dataKey="day"
                          className="text-xs"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          className="text-xs"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          allowDecimals={false}
                          axisLine={false}
                          tickLine={false}
                        />

                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          cursor={false}
                        />
                        <Bar
                          dataKey="previousWeek"
                          fill="rgba(127, 229, 255, 0.8)"
                          radius={[20, 20, 0, 0]}
                          barSize={40}
                          stackId="overlay"
                          label={false}
                        />

                        {/* Foreground (This Week) */}
                        <Bar
                          dataKey="thisWeek"
                          fill="rgba(0, 128, 128, 0.9)"
                          radius={[20, 20, 0, 0]}
                          barSize={30}
                          stackId="overlay"
                          label={false}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        Total Applications
                      </p>
                      {reportsLoading ? (
                        <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 my-1" />
                      ) : (
                        <p className="text-xl sm:text-2xl font-bold">
                          {reportStats.totalApplications}
                        </p>
                      )}
                    </div>
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        Hired Candidates
                      </p>
                      {reportsLoading ? (
                        <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 my-1" />
                      ) : (
                        <p className="text-xl sm:text-2xl font-bold">
                          {reportStats.hiredCandidates}
                        </p>
                      )}
                    </div>
                    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        Active Internships
                      </p>
                      {reportsLoading ? (
                        <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 my-1" />
                      ) : (
                        <p className="text-xl sm:text-2xl font-bold">
                          {reportStats.activeInternships}
                        </p>
                      )}
                    </div>
                    <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This will permanently delete the job description "
              {deletingInternship?.title}". This action cannot be undone and
              will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletingInternship(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {updating === deletingInternship?.id ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditInternshipDialog
        isOpen={!!editingInternship}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
        internship={editingInternship}
      />

      <CreateInternshipDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleInternshipCreated}
      />
    </div>
  );
};

export default UnitDashboard;
