// pages/MenteesActivities.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/Pagination";
import { ChevronLeft, ExternalLink, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMentorHiredCandidatesList } from "@/hooks/useMentees";

export default function MenteesActivities() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 8; // Based on the 2x4 grid in the screenshot

  // Fetching hired candidates specifically
  const { data, isLoading } = useMentorHiredCandidatesList(page, pageSize);
  
  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full mx-auto px-4 sm:px-12 lg:px-40 py-6 lg:py-10">
        
        {/* Header Section */}
        <div className="relative flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          {/* Left: Back Button */}
          <div className="flex items-center gap-4 w-full sm:w-auto z-10">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          </div>

          {/* Center: Title */}
          <h2 className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 text-2xl font-bold text-slate-700 whitespace-nowrap">
            Mentees Activities
          </h2>

          {/* Right: Dropdown */}
          <div className="w-full sm:w-48 z-10">
            <Select defaultValue="all">
              <SelectTrigger className="w-full rounded-full border-gray-200 text-gray-500">
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
        <div className="px-2 lg:px-0">
          {isLoading ? (
            <div className="text-center py-20 text-gray-400 font-medium animate-pulse">
              Loading activities...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <Users className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-400">
                No active mentee activities found
              </h3>
            </div>
          ) : (
            <>
              {/* Mentees Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((application: any, index: number) => {
                  const candidate = application.candidate;
                  const unit = application.unit;
                  const internship = application.internship;
                  // Mocking progress for visual matching if not from backend yet
                  const progress = application.projectsProgress || 40; 

                  return (
                    <Card
                      key={application.applicationId || index}
                      className="border border-gray-200 hover:shadow-md transition-shadow rounded-[2rem] flex flex-col"
                    >
                      <CardContent className="p-6">
                        
                        {/* Top row: Profile and Action */}
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            {/* Avatar with Unit Logo Overlay style */}
                            <div className="relative">
                              <Avatar className="w-14 h-14 bg-gray-100">
                                <AvatarImage src={candidate?.avatarUrl ?? undefined} className="object-cover" />
                                <AvatarFallback className="font-semibold text-gray-600">
                                  {candidate?.name?.[0]?.toUpperCase() || "C"}
                                </AvatarFallback>
                              </Avatar>
                              {/* Overlapping Company Badge (Black circle with X) */}
                              <div className="absolute -bottom-1 -right-2 w-7 h-7 bg-black rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                                {unit?.name?.[0]?.toUpperCase() || "X"}
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">
                                {candidate?.name || "Unknown Candidate"}
                              </h3>
                              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100"></span>
                                Hired by <span className="text-slate-700 font-semibold">{unit?.name || "X"}</span>
                              </div>
                            </div>
                          </div>

                          <Button 
                            variant="outline" 
                            className="rounded-full text-teal-600 border-teal-200 hover:bg-teal-50 px-4 h-9 font-medium text-sm flex items-center gap-2"
                            onClick={() => navigate(`/tasks/${application.applicationId}`)}
                          >
                            View Tasks
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Middle row: Progress Bar */}
                        <div className="mb-6">
                          <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                            <span>Projects Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-emerald-500 h-2.5 rounded-full" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Bottom row: Details */}
                        <div className="flex justify-between items-center text-sm font-medium text-gray-400">
                          <span>{internship?.title || "UI/UX Designer"}</span>
                          <span>
                            {internship?.duration || "6 Months"} | {internship?.type || "Part time"}
                          </span>
                        </div>

                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12 mb-6">
                   <Pagination
                     currentPage={page}
                     totalPages={pagination.totalPages}
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