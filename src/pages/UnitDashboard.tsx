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
    </div>
  );
};

export default UnitDashboard;
