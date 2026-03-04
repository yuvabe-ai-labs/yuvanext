// src/pages/candidate/MentorExplorerPage.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ChevronLeft, Briefcase, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import FilterIcon from "@/assets/filter.svg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Pagination from "@/components/Pagination";

import { useAvailableMentorsList } from "@/hooks/useCandidateMentors";

// Pre-defined options based on your backend schema
const MENTOR_TYPES = [
  { id: "career_guidance", label: "Career Guidance" },
  { id: "internship_support", label: "Internship Support" },
  { id: "skills_portfolio", label: "Skills & Portfolio" },
  { id: "wellbeing_confidence", label: "Wellbeing & Confidence" },
  { id: "general", label: "General" }
];

const AVAILABILITY_DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const COMMON_EXPERTISE = [
  "Frontend Development", "Backend Development", "UI/UX Design", "Data Science", "Mobile App Development", "DevOps"
];

export default function MentorExplorerPage() {
  const navigate = useNavigate();
  const pageSize = 6;
  
  // States for API Filters
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  // UI States
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Search Debounce Logic
  const handleSearch = (val: string) => {
    setSearchQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1); 
    }, 500);
  };

  useEffect(() => {
    document.body.style.overflow = showMobileFilters ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [showMobileFilters]);

  // Fetch Mentors (Server-Side Pagination & Filtering)
  const { data: mentorsResponse, isLoading: mentorsLoading } = useAvailableMentorsList(
    page, 
    pageSize, 
    debouncedSearch, 
    selectedType || undefined,
    selectedExpertise || undefined,
    selectedDay || undefined
  ); 
  
  const mentors = mentorsResponse?.data || [];
  const pagination = mentorsResponse?.pagination;

  // Filter Handlers
  const resetFilters = () => {
    setSelectedType("");
    setSelectedExpertise("");
    setSelectedDay("");
    setSearchQuery("");
    setDebouncedSearch("");
    setPage(1);
  };

  const handleToggle = (setState: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setState(prev => {
      const newValue = prev === value ? "" : value;
      setPage(1); 
      return newValue;
    });
  };

  const formatType = (type: string | null) => {
    if (!type) return "General";
    return type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 sm:px-6 lg:px-[7.5rem] py-4 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-5">
          
          {/* Left Sidebar - Filters (Desktop) */}
          <div className="hidden w-full lg:w-80 bg-card pt-5 border border-gray-200 rounded-3xl lg:flex flex-col lg:h-[90vh] lg:sticky lg:top-6 mb-4 lg:mb-0">
            <div className="flex items-center justify-between mb-4 px-6 py-3 border-b bg-card sticky top-0 z-10">
              <h2 className="text-lg font-bold">Filters</h2>
              <Button variant="ghost" className="text-primary text-sm font-medium" onClick={resetFilters}>
                Reset all
              </Button>
            </div>

            <div className="px-6 pb-6 overflow-y-auto flex-1 space-y-8">
              {/* Search */}
              <div>
                <Label className="text-sm font-medium text-gray-500 mb-3 block">Search Mentors</Label>
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-8 border-gray-300 rounded-3xl"
                  />
                </div>
              </div>

              {/* Mentor Type */}
              <FilterSection
                label="Mentor Type"
                list={MENTOR_TYPES.map(t => t.label)}
                originalList={MENTOR_TYPES.map(t => t.id)}
                selected={selectedType}
                onToggle={(v: string) => handleToggle(setSelectedType, v)}
              />

              {/* Expertise Area */}
              <FilterSection
                label="Expertise Areas"
                list={COMMON_EXPERTISE}
                originalList={COMMON_EXPERTISE}
                selected={selectedExpertise}
                onToggle={(v: string) => handleToggle(setSelectedExpertise, v)}
              />

              {/* Availability Day */}
              <FilterSection
                label="Availability Day"
                list={AVAILABILITY_DAYS}
                originalList={AVAILABILITY_DAYS}
                selected={selectedDay}
                onToggle={(v: string) => handleToggle(setSelectedDay, v)}
              />
            </div>
          </div>

          {/* Mobile Filters Overlay */}
          {showMobileFilters && (
            <>
              <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setShowMobileFilters(false)} />
              <div className="md:hidden fixed top-0 left-0 h-full w-[75%] bg-white z-50 p-4 overflow-y-auto shadow-xl space-y-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Filters</h2>
                  <button className="text-primary text-xl" onClick={() => setShowMobileFilters(false)}>✕</button>
                </div>
                
                <div className="space-y-6">
                   <FilterSection
                    label="Mentor Type"
                    list={MENTOR_TYPES.map(t => t.label)}
                    originalList={MENTOR_TYPES.map(t => t.id)}
                    selected={selectedType}
                    onToggle={(v: string) => handleToggle(setSelectedType, v)}
                  />
                  <FilterSection
                    label="Expertise Areas"
                    list={COMMON_EXPERTISE}
                    originalList={COMMON_EXPERTISE}
                    selected={selectedExpertise}
                    onToggle={(v: string) => handleToggle(setSelectedExpertise, v)}
                  />
                  <FilterSection
                    label="Availability Day"
                    list={AVAILABILITY_DAYS}
                    originalList={AVAILABILITY_DAYS}
                    selected={selectedDay}
                    onToggle={(v: string) => handleToggle(setSelectedDay, v)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Main Content Area */}
          <div className="flex-1 w-full flex flex-col">
            {/* Header / Mobile Toggle */}
            <div className="flex items-center justify-between mb-4 lg:hidden w-full">
              <div className="flex items-center gap-2">
                <button className="text-gray-500 text-xl" onClick={() => window.history.back()}>
                  <ChevronLeft size={28} strokeWidth={2} />
                </button>
                <h1 className="text-lg font-bold text-gray-600">
                  {pagination?.totalItems || 0} Mentor{pagination?.totalItems !== 1 ? "s" : ""}
                </h1>
              </div>
              <button className="text-primary text-xl font-medium" onClick={() => setShowMobileFilters(true)}>
                <img src={FilterIcon} alt="Filter" className="w-6 h-6" />
              </button>
            </div>

            <div className="hidden lg:flex justify-between items-center mb-6">
              <h1 className="text-2xl text-gray-600 font-medium">
                Explore {pagination?.totalItems || 0} Mentor{pagination?.totalItems !== 1 ? "s" : ""}
              </h1>
            </div>

            {/* Mentors Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 mb-8">
              {mentors.map((mentor: any) => {
                return (
                  <Card
                    key={mentor.userId}
                    className="overflow-hidden rounded-3xl hover:shadow-lg transition-all cursor-pointer flex flex-col border border-gray-100"
                    onClick={() => navigate(`/mentor/${mentor.userId}`)}
                  >
                    <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 relative flex justify-center">
                       <Avatar className="w-20 h-20 ring-4 ring-white absolute -bottom-10 bg-white shadow-md">
                        <AvatarImage src={mentor.image ?? undefined} alt={mentor.name ?? "Mentor"} className="object-cover" />
                        <AvatarFallback className="font-semibold text-2xl text-blue-700">
                          {mentor.name?.charAt(0).toUpperCase() || "M"}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <CardContent className="px-5 pb-5 pt-16 space-y-3 text-center flex-1 flex flex-col">
                      <div>
                        {/* Name fixed with better margin and explicitly bold text */}
                        <h3 className="font-bold text-xl text-gray-900">{mentor.name || "Unknown Mentor"}</h3>
                        <div className="flex items-center justify-center gap-1 mt-1 text-sm text-blue-600 font-medium">
                          <Briefcase className="w-4 h-4" />
                          <span>{formatType(mentor.mentorType)}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 line-clamp-3 flex-1 mt-2">
                        {mentor.experienceSnapshot || "Ready to guide and share industry expertise."}
                      </p>

                      <div className="flex flex-wrap justify-center gap-2 mt-4">
                         {(mentor.expertiseAreas || []).slice(0, 3).map((area: string, i: number) => (
                           <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-600 font-normal hover:bg-gray-200">
                             {area}
                           </Badge>
                         ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Skeletons */}
              {mentorsLoading && Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden rounded-3xl">
                  <Skeleton className="h-24 w-full" />
                  <CardContent className="px-5 pb-5 pt-16 space-y-3 flex flex-col items-center">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                    <Skeleton className="h-16 w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {!mentorsLoading && mentors.length === 0 && (
              <div className="text-center py-20 flex flex-col items-center">
                <Users className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-500">No mentors match your filters.</h3>
                <Button variant="outline" onClick={resetFilters} className="mt-4 rounded-full">Clear Filters</Button>
              </div>
            )}

            {/* Server-Side Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-auto">
                <Pagination
                  currentPage={page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------ Adapted Filter Component for Single Selection ------------------
const FilterSection = ({ label, list, originalList, selected, onToggle }: any) => {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="relative">
      <Label className="text-sm font-medium text-gray-500 mb-3 block">{label}</Label>
      <div className="space-y-3 mt-3">
        {(showAll ? list : list.slice(0, 5)).map((displayItem: string, idx: number) => {
          const actualValue = originalList[idx];
          return (
            <div key={actualValue} className="flex items-center space-x-2">
              <Checkbox 
                checked={selected === actualValue} 
                onCheckedChange={() => onToggle(actualValue)} 
              />
              <span className="text-sm text-gray-700">{displayItem}</span>
            </div>
          );
        })}
        {list.length > 5 && (
          <Button variant="link" className="p-0 text-primary text-sm font-medium" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show Less" : `+${list.length - 5} More`}
          </Button>
        )}
      </div>
    </div>
  );
};