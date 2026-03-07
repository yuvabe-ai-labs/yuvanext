import { useSession } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import { Mail, Pen, Camera, Briefcase, CalendarDays, Clock, Users, Globe } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

// Custom Mentor Hooks & Dialogs
import { useMentorProfile } from "@/hooks/useMentorProfile";
import { useMentorAvatarOperations } from "@/hooks/useMentorAvatar";
import { MentorExperienceDialog, MentorExpertiseDialog, MentorSettingsDialog } from "@/components/MentorEditDialogs";

// Reused components for Links and Images
import { ImageUploadDialog } from "@/components/ImageUploadDialog";
import AIEditIcon from "@/components/ui/custom-icons";

const MentorProfile = () => {
  const { data: session } = useSession();
  
  // 1. Use pure Mentor hooks
  const { data: profileData, isLoading, refetch } = useMentorProfile();
  console.log("Fetched mentor profile data:", profileData); // Debug log to check the API response structure
  const { uploadAvatar, deleteAvatar } = useMentorAvatarOperations();
  
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  // 2. Safely extract your DB schema variables
  const expertiseAreas = profileData?.expertiseAreas ?? [];
  const availabilityDays = profileData?.availabilityDays ?? [];
  const communicationModes = profileData?.communicationModes ?? [];

  const rawWindows = profileData?.availabilityTimeWindows as any;
  let availabilityTimeWindows: any[] = [];
  let legacyTimeStr = "";

  if (Array.isArray(rawWindows)) {
    availabilityTimeWindows = rawWindows;
  } else if (typeof rawWindows === "string") {
    if (rawWindows.trim().startsWith("[")) {
      try { availabilityTimeWindows = JSON.parse(rawWindows); } catch(e) {}
    } else {
      legacyTimeStr = rawWindows; // Captures "9 AM - 12 PM"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="relative h-48 bg-gradient-to-r from-primary to-primary-foreground" />
        <div className="w-full px-4 sm:px-8 lg:px-12 -mt-24 relative z-10">
          <Card className="mb-8 bg-white"><CardContent className="p-6"><Skeleton className="h-24 w-24 rounded-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="relative h-[17.625rem] bg-gradient-to-r from-primary to-primary-foreground" />

      {/* FULL SCREEN WRAPPER */}
      <div className="-mt-[8.25rem] pt-0 container px-4 sm:px-6 lg:px-[7.5rem] py-4 lg:py-10">
        
        {/* Header Profile Card */}
        <Card className="relative mb-2 min-h-[185px] h-auto border-gray-200 bg-white rounded-3xl shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              
              {/* Profile Avatar (Progress Ring Removed) */}
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                  <AvatarImage src={profileData?.avatarUrl || ""} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {session?.user?.name?.charAt(0).toUpperCase() || "M"}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => setIsAvatarDialogOpen(true)}
                  className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                  {session?.user?.name || "Mentor Name"}
                </h1>
                <p className="text-muted-foreground font-medium mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> 
                  {profileData?.mentorType ? profileData.mentorType.replace(/_/g, ' ') : "Professional Mentor"}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Mail className="w-4 h-4" />
                  <span>{session?.user?.email}</span>
                </div>
                <p className="text-muted-foreground text-xs text-gray-400 mt-3">
                  {`Last updated - ${profileData?.updatedAt ? formatDistanceToNow(new Date(profileData.updatedAt), { addSuffix: true }) : "recently"}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
          
          {/* Left Sidebar (Settings) */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="rounded-3xl border-gray-200 shadow-sm h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg text-gray-900">Capacity & Comms</h3>
                  <MentorSettingsDialog profileData={profileData}>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary bg-gray-50 hover:bg-blue-50 rounded-full h-8 w-8 p-0">
                      <Pen className="w-4 h-4" />
                    </Button>
                  </MentorSettingsDialog>
                </div>
                
                <div className="space-y-6 text-sm text-gray-700">
                  <div>
                    <p className="text-gray-500 flex items-center gap-2 mb-2 font-medium"><Users className="w-4 h-4"/> Capacity</p>
                    <p className="font-semibold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg inline-block border border-gray-100">
                      {profileData?.mentoringCapacity || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 flex items-center gap-2 mb-2 font-medium"><Globe className="w-4 h-4"/> Modes</p>
                    <div className="flex flex-wrap gap-2">
                      {communicationModes.length > 0 ? (
                        communicationModes.map((mode: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="capitalize bg-white shadow-sm border-gray-200">{mode}</Badge>
                        ))
                      ) : <span className="text-gray-400 italic">Not set</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 flex items-center gap-2 mb-2 font-medium"><CalendarDays className="w-4 h-4"/> Availability Days</p>
                    <div className="flex flex-wrap gap-2">
                      {availabilityDays.length > 0 ? (
                        availabilityDays.map((day: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 capitalize">{day}</Badge>
                        ))
                      ) : <span className="text-gray-400 italic">Not set</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 flex items-center gap-2 mb-2 font-medium"><Clock className="w-4 h-4"/> Time Windows</p>
                    <div className="flex flex-col gap-2">
                      {legacyTimeStr ? (
                        <span className="font-semibold text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg w-fit border border-gray-100">
                          {legacyTimeStr}
                        </span>
                      ) : availabilityTimeWindows.length > 0 ? (
                        availabilityTimeWindows.map((window: {start: string, end: string}, idx: number) => (
                          <span key={idx} className="font-semibold text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg w-fit border border-gray-100">
                            {window.start} <span className="text-gray-400 mx-1 font-normal">to</span> {window.end}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Experience Snapshot */}
            <Card className="rounded-3xl border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Experience Snapshot</h3>
                  <MentorExperienceDialog currentText={profileData?.experienceSnapshot || ""}>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary bg-gray-50 hover:bg-blue-50 rounded-full h-8 w-8 p-0">
                      <Pen className="w-4 h-4" />
                    </Button>
                  </MentorExperienceDialog>
                </div>
                <div className="border border-gray-100 bg-gray-50/50 rounded-2xl p-5 min-h-[120px]">
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-[15px]">
                    {profileData?.experienceSnapshot || (
                      <div className="flex items-center gap-2 text-muted-foreground italic">
                        <AIEditIcon /> Add a snapshot of your experience to help mentees understand your background.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expertise Areas */}
            <Card className="rounded-3xl border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Expertise Areas</h3>
                  <MentorExpertiseDialog currentAreas={expertiseAreas}>
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-blue-50 bg-blue-50/50 rounded-full px-4">
                      Edit Areas
                    </Button>
                  </MentorExpertiseDialog>
                </div>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  {expertiseAreas.length > 0 ? (
                    expertiseAreas.map((area: string, index: number) => (
                      <Badge key={index} variant="outline" className="px-4 py-2 border-gray-200 bg-white text-gray-800 text-sm shadow-sm">
                        {area}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm italic">No expertise areas added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {profileData && (
        <ImageUploadDialog
          isOpen={isAvatarDialogOpen}
          onClose={() => setIsAvatarDialogOpen(false)}
          currentImageUrl={profileData.avatarUrl}
          userId={profileData.userId}
          userName={session?.user?.name || "Mentor"}
          imageType="avatar"
          entityType="mentor" 
          onSuccess={() => refetch()} 
          onUpload={(file) => uploadAvatar.mutateAsync(file)}
          onDelete={() => deleteAvatar.mutateAsync()}
          isProcessing={uploadAvatar.isPending || deleteAvatar.isPending}
        />
      )}
    </div>
  );
};

export default MentorProfile;