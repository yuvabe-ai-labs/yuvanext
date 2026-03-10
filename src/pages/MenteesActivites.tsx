import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/Pagination";
import { ChevronLeft, Users, MoveUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useCandidateTasks, useHiredApplicantsList } from "@/hooks/useCandidateTasks"; 
import { calculateOverallTaskProgress } from "@/utils/taskProgress"; 
import Navbar from "@/components/Navbar";

// --- Separated Card Component ---
function HiredCandidateCard({ application }: { application: any }) {
  const navigate = useNavigate();
  
  // Safely extract data depending on how the DTO from /tasks is structured
  const applicationId = application.applicationId;
  const name = application.applicantName || application.candidateName || application.candidate?.name || "Unknown Candidate";
  const avatarUrl = application.candidateAvatarUrl || application.candidate?.avatarUrl;
  
  const internshipTitle = application.internshipName || application.internship?.title || "Internship";
  const duration = application.internshipDuration || application.internship?.duration || "N/A";
  const jobType = application.internshipJobType || application.internship?.type || application.internship?.jobType || "N/A";
  
  const unitName = application.unitName || application.unit?.name || "Unknown Unit";
  const unitAvatarUrl = application.unitAvatarUrl || application.unit?.avatarUrl;

  // Fetch task data to calculate live progress
  const { data } = useCandidateTasks(applicationId);

  const taskProgress = useMemo(() => {
    if (!data?.tasks || data.tasks.length === 0) return 0;
    try {
      return calculateOverallTaskProgress(data.tasks);
    } catch (e) {
      return 0;
    }
  }, [data?.tasks]);

  const formatJobType = (type: string | null | undefined) => {
    if (!type || type === "N/A") return "Not specified";
    const jobTypeMap: { [key: string]: string } = {
      full_time: "Full time",
      part_time: "Part time",
      contract: "Contract",
      internship: "Internship",
    };
    return jobTypeMap[type.toLowerCase()] || type;
  };

  return (
    <Card className="border border-gray-200 rounded-3xl hover:shadow-lg transition-shadow bg-white h-full flex flex-col">
      <CardContent className="p-6 flex flex-col flex-1">
        
        {/* TOP ROW: Profile Info & View Tasks Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex -space-x-4 shrink-0">
              {/* Candidate Avatar */}
              <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-white relative z-10">
                <AvatarImage
                  src={avatarUrl || undefined}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">
                  {name[0]?.toUpperCase() || "C"}
                </AvatarFallback>
              </Avatar>

              {/* Unit Avatar */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black flex items-center justify-center border-2 border-white overflow-hidden relative z-20">
                {unitAvatarUrl ? (
                  <img
                    src={unitAvatarUrl}
                    alt="unit"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-lg sm:text-xl font-bold uppercase">
                    {unitName[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-emerald-500 shrink-0">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-xs sm:text-sm text-gray-500 font-medium truncate">
                  Hired by {unitName}
                </span>
              </div>
            </div>
          </div>

          {/* View Tasks Button */}
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-teal-600 text-teal-600 hover:bg-teal-50 px-3 sm:px-4 h-9 text-xs shrink-0 ml-4"
            onClick={() => navigate(`/mentor/candidate-tasks/${applicationId}`)}
          >
            <span className="hidden sm:inline">View Tasks</span>
            <span className="sm:hidden">Tasks</span>
            <MoveUpRight className="w-3.5 h-3.5 ml-1 sm:ml-2" />
          </Button>
        </div>

        {/* MIDDLE SECTION: Progress Bar */}
        <div className="space-y-2 flex-1 flex flex-col justify-center mb-6">
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold text-slate-700">
              Projects Progress
            </span>
            <span className="text-sm font-bold text-slate-700">
              {taskProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${taskProgress}%` }}
            ></div>
          </div>
        </div>

        {/* BOTTOM SECTION: Internship Title & Duration */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
          <span className="text-sm font-semibold text-slate-700 truncate pr-4">
            {internshipTitle}
          </span>
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
            {duration} | {formatJobType(jobType)}
          </span>
        </div>
        
      </CardContent>
    </Card>
  );
}

// --- Main Page Component ---
// --- Main Page Component ---
export default function MenteesActivities() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all"); // 1. Added filter state
  const pageSize = 8; 

  const { data: allItems = [], isLoading } = useHiredApplicantsList();

  // 2. Filter the array BEFORE applying pagination
  const filteredItems = useMemo(() => {
    return allItems.filter((application: any) => {
      if (filter === "all") return true;

      // ⚠️ IMPORTANT: Adjust this logic to match your API's properties!
      // Example A: If your API returns a status string
      if (filter === "active") {
        return application.status === "active" || application.status === "ongoing";
      }
      if (filter === "completed") {
        return application.status === "completed";
      }

      // Example B: If your API returns a progress number
      // if (filter === "active") return application.progress < 100;
      // if (filter === "completed") return application.progress === 100;

      return true;
    });
  }, [allItems, filter]);

  // 3. Calculate pagination based on the FILTERED items
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const currentItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  // 4. Handle filter changes and reset the page
  const handleFilterChange = (value: string) => {
    setFilter(value);
    setPage(1); // Crucial: Reset to page 1 so you don't get stuck on an empty page
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-20 xl:px-40 py-6 lg:py-10">
        
        {/* Header Section */}
        <div className="relative flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto z-10">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          </div>

          <h2 className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 text-2xl font-bold text-slate-700 whitespace-nowrap">
            Mentees Activities
          </h2>

          <div className="w-full sm:w-48 z-10">
            {/* 5. Bind the Select component to your state */}
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full rounded-full border-gray-300 text-gray-600 bg-white">
                <SelectValue placeholder="Select Matches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Matches</SelectItem>
                <SelectItem value="active">Active Projects</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-2">
          {isLoading ? (
            <div className="text-center py-20 text-gray-400 font-medium animate-pulse">
              Loading activities...
            </div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <Users className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-400">
                {filter === "all" 
                  ? "No active mentee activities found" 
                  : `No ${filter} projects found`}
              </h3>
            </div>
          ) : (
            <>
              {/* CSS Grid for the Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentItems.map((application: any, index: number) => (
                  <HiredCandidateCard 
                    key={application.applicationId || index} 
                    application={application} 
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12 mb-6">
                   <Pagination
                     currentPage={page}
                     totalPages={totalPages}
                     onPageChange={setPage}
                   />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}