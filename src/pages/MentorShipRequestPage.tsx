import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/Pagination";
import { Search, Users, ChevronLeft, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { useIncomingRequests, useRespondToRequest } from "@/hooks/useMentorShip";

export default function MentorshipRequestsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const pageSize = 6;

  // Dialog State
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<"accept" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Search Debounce Logic
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1); // Reset to page 1 on new search
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Fetch API
  const { data: responseData, isLoading } = useIncomingRequests(page, pageSize, "pending", debouncedSearch);
  const respondMutation = useRespondToRequest();

  const items = responseData?.data ?? [];
  const pagination = responseData?.pagination;

  // Action Handlers
  const handleActionClick = (request: any, action: "accept" | "reject") => {
    setSelectedRequest(request);
    setActionType(action);
    setRejectionReason("");
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return;
    
    await respondMutation.mutateAsync({
      requestId: selectedRequest.id,
      action: actionType,
      rejectionReason: actionType === "reject" ? rejectionReason : undefined,
    });
    
    setSelectedRequest(null);
    setActionType(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto px-4 sm:px-12 lg:px-40 py-6 lg:py-10">
        
        {/* Header */}
        <div className="relative flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-md font-medium text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          </div>

          <h2 className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 text-2xl font-bold text-gray-600 whitespace-nowrap">
            Pending Requests
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by candidate name"
              className="pl-10 rounded-full border-gray-300 w-full"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="px-2 lg:px-10">
          {isLoading ? (
            <div className="text-center py-20 text-gray-400 font-medium animate-pulse">
              Loading requests...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <Users className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-400">
                {debouncedSearch ? "No matching requests found" : "No Pending Requests"}
              </h3>
            </div>
          ) : (
            <>
              {/* Requests Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((request: any) => {
                  const candidate = request.candidate;
                  const skills = Array.isArray(candidate?.skills) ? candidate.skills : [];
                  const profileSummary = candidate?.profileSummary || "No profile summary available.";

                  return (
                    <Card
                      key={request.id}
                      className="min-w-[350px] border border-border/50 hover:shadow-lg transition-shadow rounded-3xl flex flex-col"
                    >
                      <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 flex-1 flex flex-col">
                        
                        {/* Avatar & Info */}
                        <div className="flex items-center gap-3 sm:gap-5">
                          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-purple-100">
                            <AvatarImage
                              src={candidate?.avatarUrl ?? undefined}
                              alt={candidate?.name ?? "Candidate"}
                              className="object-cover"
                            />
                            <AvatarFallback className="font-semibold bg-purple-100 text-purple-700">
                              {candidate?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "C"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 truncate">
                              {candidate?.name || "Unknown"}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 mb-2 truncate">
                              {candidate?.experienceLevel || "Candidate"}
                            </p>
                            <span className="text-xs sm:text-sm font-medium flex items-center gap-1 text-purple-600 bg-purple-50 w-fit px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" />
                              Pending Request
                            </span>
                          </div>
                        </div>

                        {/* Request Message */}
                        {request.message && (
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm text-gray-700 italic line-clamp-2">
                            "{request.message}"
                          </div>
                        )}

                        {/* Profile Summary */}
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed line-clamp-2 flex-1">
                          {profileSummary}
                        </p>

                        {/* Skills */}
                        <div className="min-h-7">
                          {skills.length > 0 && (
                            <div className="flex gap-2 overflow-hidden">
                              {skills.slice(0, 3).map((skill: string, i: number) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-[10px] text-gray-600 bg-muted/40 rounded-full px-2 py-1 whitespace-nowrap"
                                >
                                  {skill}
                                </Badge>
                              ))}
                              {skills.length > 3 && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] text-gray-600 bg-muted/40 rounded-full px-2 py-1 whitespace-nowrap"
                                >
                                  +{skills.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="border-t border-border/40"></div>

                       
                        <div className="flex flex-col gap-3 mt-auto">
                          {/* <Button
                            variant="outline"
                            className="w-full border-2 border-teal-500 text-teal-600 hover:bg-teal-50 text-sm rounded-full cursor-pointer"
                            onClick={() => navigate(`/candidate/${candidate.userId}`)}
                          >
                            View Profile
                          </Button> */}
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 text-sm rounded-full cursor-pointer"
                              onClick={() => handleActionClick(request, "reject")}
                            >
                              Decline
                            </Button>
                            <Button
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full cursor-pointer"
                              onClick={() => handleActionClick(request, "accept")}
                            >
                              Accept
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                  className="mt-10"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Accept / Decline Confirmation Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "accept" ? "Accept Mentorship Request" : "Decline Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "accept" 
                ? `Are you sure you want to accept ${selectedRequest?.candidate?.name}? Note: Accepting this will automatically reject their other pending requests.` 
                : `Please provide a reason for declining ${selectedRequest?.candidate?.name}'s request (optional).`}
            </DialogDescription>
          </DialogHeader>
          
          {actionType === "reject" && (
            <Textarea
              placeholder="E.g., I am currently at capacity..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-4"
              maxLength={300}
            />
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setSelectedRequest(null)} disabled={respondMutation.isPending}>
              Cancel
            </Button>
            <Button 
              variant={actionType === "reject" ? "destructive" : "default"}
              onClick={handleConfirmAction}
              disabled={respondMutation.isPending}
            >
              {respondMutation.isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}