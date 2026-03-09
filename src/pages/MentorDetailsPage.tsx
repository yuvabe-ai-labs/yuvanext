// src/pages/candidate/MentorDetailsPage.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Briefcase, UserCheck, Clock, CalendarDays, Globe, Users, CloudCog } from "lucide-react";

import { useMentorDetails, useCandidateOwnRequestsList, useSendMentorshipRequest } from "@/hooks/useCandidateMentors";

export default function MentorDetailsPage() {
  const { mentorId } = useParams();
  const navigate = useNavigate();

  // Queries
  const { data: mentorResponse, isLoading } = useMentorDetails(mentorId as string);
  console.log("Mentor Details Response:", mentorResponse);
  const { data: requestsResponse } = useCandidateOwnRequestsList();
  const requestMutation = useSendMentorshipRequest();

  const mentor = mentorResponse?.data;
  const ownRequests = requestsResponse?.data || [];

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [requestError, setRequestError] = useState("");

  // Logic Check
  const acceptedRequest = ownRequests.find((r: any) => r.status === "accepted");
  const hasActiveMentor = !!acceptedRequest;
  const isCurrentMentor = acceptedRequest?.mentorUserId === mentorId;
  const isPending = ownRequests.some((r: any) => r.status === "pending" && r.mentorUserId === mentorId);

  // Button UI derivation
  let buttonText = "Request Mentorship";
  let isDisabled = false;
  if (isCurrentMentor) { buttonText = "Current Mentor"; isDisabled = true; }
  else if (isPending) { buttonText = "Request Pending"; isDisabled = true; }
  else if (hasActiveMentor) { buttonText = "You already have a mentor"; isDisabled = true; }

  const handleSendRequest = async () => {
    if (!mentorId) return;
    setRequestError("");
    try {
      await requestMutation.mutateAsync({ mentorId, message: message.trim() || undefined });
      setIsDialogOpen(false);
    } catch (error: any) {
      setRequestError(error.message || "Failed to send request.");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading mentor details...</div>;
  }

  if (!mentor) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Mentor not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-primary to-primary-foreground w-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <Card className="rounded-3xl shadow-lg border-0">
          <CardContent className="p-8 sm:p-12 relative">
            
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="absolute top-6 left-6 text-gray-500 hover:text-gray-900 bg-white/80 p-2 rounded-full backdrop-blur-md transition-colors">
              <ChevronLeft size={24} />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <Avatar className="w-32 h-32 ring-8 ring-white shadow-xl bg-white">
                <AvatarImage src={mentor.image ?? undefined} className="object-cover" />
                <AvatarFallback className="text-4xl text-blue-700 bg-blue-50 font-bold">
                  {mentor.name?.charAt(0).toUpperCase() || "M"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{mentor.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600 font-medium">
                  <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    <Briefcase className="w-4 h-4" />
                    {mentor.mentorType?.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </span>
                  {mentor.availabilityTimeWindows && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4" /> {mentor.availabilityTimeWindows}
                    </span>
                  )}
                  {mentor.mentoringCapacity && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> Capacity: {mentor.mentoringCapacity}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="w-full md:w-auto mt-4 md:mt-0">
                <Button 
                  size="lg"
                  disabled={isDisabled}
                  className={`w-full md:w-auto rounded-full px-8 py-6 text-base ${isCurrentMentor ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  onClick={() => setIsDialogOpen(true)}
                >
                  {isCurrentMentor && <UserCheck className="w-5 h-5 mr-2" />}
                  {isPending && <Clock className="w-5 h-5 mr-2" />}
                  {buttonText}
                </Button>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-10">
              
              {/* Left Column (Main Info) */}
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">About Me</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {mentor.experienceSnapshot || "No detailed experience provided yet."}
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Expertise Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertiseAreas?.map((area: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1.5 px-4 rounded-full font-medium">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column (Sidebar Info) */}
              <div className="space-y-6 bg-gray-50 p-6 rounded-3xl h-fit border border-gray-100">
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <CalendarDays className="w-5 h-5 text-blue-600" /> Availability
                  </h4>
                  <div className="space-y-2">
                    {mentor.availabilityDays?.map((day: string) => (
                      <div key={day} className="text-sm text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-200 capitalize shadow-sm">
                        {day}
                      </div>
                    ))}
                  </div>
                </div>

                {mentor.communicationModes && mentor.communicationModes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Preferred Comms</h4>
                    <div className="flex flex-wrap gap-2">
                      {mentor.communicationModes.map((mode: string) => (
                        <Badge key={mode} variant="outline" className="capitalize text-gray-600">
                          {mode}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Request Mentorship</DialogTitle>
            <DialogDescription>
              Introduce yourself to <strong className="text-gray-900">{mentor.name}</strong>. Share what you hope to achieve.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            {requestError && <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm">{requestError}</div>}
            <Textarea
              placeholder="Hi! I'd love your guidance on..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[140px] resize-none focus-visible:ring-blue-500 rounded-xl"
              maxLength={500}
            />
            <p className="text-xs text-right text-gray-400">{message.length} / 500</p>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={requestMutation.isPending} className="rounded-full px-6">
              Cancel
            </Button>
            <Button onClick={handleSendRequest} disabled={requestMutation.isPending} className="bg-blue-600 hover:bg-blue-700 rounded-full px-6">
              {requestMutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}