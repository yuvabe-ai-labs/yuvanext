// import { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import Pagination from "@/components/Pagination";
// import { Search, Users, ChevronLeft, Mail } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { useAcceptedCandidatesList } from "@/hooks/useMentees";
// import type { MentorAcceptedCandidate } from "@/types/mentor.types";

// export default function MenteesManagement() {
//   const navigate = useNavigate();
//   const [page, setPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState(""); 
//   const pageSize = 6;

//   // Search Debounce Logic
//   const timerRef = useRef<NodeJS.Timeout | null>(null);
  
//   const handleSearch = (val: string) => {
//     setSearchQuery(val);
//     if (timerRef.current) clearTimeout(timerRef.current);
    
//     timerRef.current = setTimeout(() => {
//       setDebouncedSearch(val);
//       setPage(1);
//     }, 500);
//   };

//   useEffect(() => {
//     return () => {
//       if (timerRef.current) clearTimeout(timerRef.current);
//     };
//   }, []);

//   // 1. Fetch data directly from your API
//   const candidatesQuery = useAcceptedCandidatesList(page, pageSize, debouncedSearch);

//   const items: MentorAcceptedCandidate[] = candidatesQuery.data?.data ?? [];
//   const pagination = candidatesQuery.data?.pagination;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="w-full mx-auto px-4 sm:px-12 lg:px-40 py-6 lg:py-10">
//         <div className="relative flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
//           {/* Left */}
//           <div className="flex items-center gap-4 w-full sm:w-auto">
//             <button
//               onClick={() => navigate(-1)}
//               className="flex items-center gap-1 text-md font-medium text-gray-600 hover:text-gray-900"
//             >
//               <ChevronLeft className="w-5 h-5" />
//               Back
//             </button>
//           </div>

//           {/* Center title */}
//           <h2 className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 text-2xl font-bold text-gray-600 whitespace-nowrap">
//             Accepted Mentees
//           </h2>

//           {/* Right */}
//           <div className="relative w-full sm:w-64">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <Input
//               placeholder="Search by name"
//               className="pl-10 rounded-full border-gray-300 w-full"
//               value={searchQuery}
//               onChange={(e) => handleSearch(e.target.value)}
//             />
//           </div>
//         </div>

//         <div className="px-0 md:px-20">
//           {/* Content Area */}
//           {candidatesQuery.isLoading ? (
//             <div className="text-center py-20 text-gray-400 font-medium animate-pulse">
//               Loading candidates...
//             </div>
//           ) : items.length === 0 ? (
//             <div className="text-center py-20 flex flex-col items-center">
//               <Users className="w-16 h-16 text-gray-200 mb-4" />
//               <h3 className="text-lg font-semibold text-gray-400">
//                 {debouncedSearch ? "No matching candidates found" : "No Accepted Candidates"}
//               </h3>
//             </div>
//           ) : (
//             <>
//               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//                 {items.map((item) => {
//                   const { candidate } = item;
//                   const skills = candidate.skills ?? [];

//                   return (
//                     <Card
//                       key={candidate.userId}
//                       className="relative overflow-hidden rounded-[20px] border border-teal-500/30 bg-white shadow-sm transition-all duration-300 hover:shadow-md w-full max-w-[360px] h-[300px] p-1.5 mx-auto"
//                     >
//                       {/* Banner Background */}
//                       <div className="relative w-full h-[100px] rounded-t-[18px] overflow-visible bg-gradient-to-r from-teal-400 to-emerald-500">
                        
//                         {/* Experience Level Badge */}
//                         {candidate.experienceLevel && (
//                           <div className="absolute top-2 right-2 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-teal-700 shadow-sm z-10 backdrop-blur-sm">
//                              {candidate.experienceLevel}
//                           </div>
//                         )}
                        
//                         {/* Avatar */}
//                         <div className="absolute bottom-0 left-5 translate-y-1/6 w-[64px] h-[64px] flex items-center justify-center z-20 rounded-full bg-gray-100 text-teal-700 border-4 border-white shadow-sm">
//                           {candidate.avatarUrl ? (
//                             <img
//                               src={candidate.avatarUrl}
//                               alt={`${candidate.name} avatar`}
//                               className="w-full h-full object-cover rounded-full bg-white"
//                             />
//                           ) : (
//                             <span className="text-2xl font-bold uppercase">
//                               {candidate.name?.charAt(0) || "C"}
//                             </span>
//                           )}
//                         </div>
//                       </div>

//                       {/* Content */}
//                       <div className="-mt-[32px] bg-white rounded-[18px] pt-[40px] pb-[16px] px-[16px] z-10 relative flex flex-col h-[calc(100%-100px)]">
                        
//                         <div className="flex justify-between items-start">
//                           <h3 className="text-[18px] font-semibold text-gray-900 leading-tight text-left truncate flex-1 pr-2">
//                             {candidate.name}
//                           </h3>
//                         </div>
                        
//                         <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 truncate">
//                           <Mail className="w-3 h-3 flex-shrink-0" />
//                           <span className="truncate">{candidate.email}</span>
//                         </div>

//                         <p className="text-[13px] text-gray-600 mt-3 line-clamp-2 text-left">
//                           {candidate.profileSummary || "No profile summary available."}
//                         </p>

//                         {/* Skills Preview */}
//                         <div className="mt-3 flex gap-1.5 overflow-hidden">
//                           {skills.slice(0, 3).map((skill, idx) => (
//                             <Badge key={idx} variant="secondary" className="text-[10px] bg-gray-100 text-gray-600 rounded-full font-normal px-2">
//                               {skill}
//                             </Badge>
//                           ))}
//                           {skills.length > 3 && (
//                             <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600 rounded-full font-normal px-2">
//                               +{skills.length - 3}
//                             </Badge>
//                           )}
//                         </div>
                        
//                         <div className="flex justify-center mt-auto pt-2 border-t border-gray-50">
//                           <Button
//                             variant="link"
//                             className="text-teal-600 font-medium p-0 hover:text-teal-800"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               navigate(`/candidate/${candidate.userId}`); // Adjust route to match your app
//                             }}
//                           >
//                             View Profile
//                           </Button>
//                         </div>
//                       </div>
//                     </Card>
//                   );
//                 })}
//               </div>

//               {/* Pagination */}
//               {pagination && pagination.totalPages > 1 && (
//                 <Pagination
//                   currentPage={page}
//                   totalPages={pagination.totalPages}
//                   onPageChange={setPage}
//                   className="mt-10"
//                 />
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }