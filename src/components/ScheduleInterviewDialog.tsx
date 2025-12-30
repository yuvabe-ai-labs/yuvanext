import { useState, useEffect } from "react";
import { Calendar, Clock, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useInterviews } from "@/hooks/useInterviews";

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  candidateEmail: string;
  applicationId: string;
  candidateProfileId: string; // student_id
  onSuccess?: () => void;
}

export default function ScheduleInterviewDialog({
  open,
  onOpenChange,
  candidateName,
  candidateEmail,
  applicationId,
  candidateProfileId,
  onSuccess,
}: ScheduleInterviewDialogProps) {
  const { toast } = useToast();
  const { createInterview } = useInterviews();
  const [isLoading, setIsLoading] = useState(false);
  const [senderEmail, setSenderEmail] = useState<string>("");
  const [unitProfileId, setUnitProfileId] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    meetingType: "zoom",
  });

  const [guestEmails, setGuestEmails] = useState<string[]>(
    candidateEmail ? [candidateEmail] : []
  );

  // Fetch current user's email and profile ID
  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setSenderEmail(user.email);

        // Fetch profile ID
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast({
            title: "Error",
            description: "Failed to fetch user profile",
            variant: "destructive",
          });
          return;
        }

        if (profileData) {
          setUnitProfileId(profileData.id);
          console.log("✅ Unit Profile ID fetched:", profileData.id);
        }
      }
    };
    fetchUserData();
  }, []);

  // Reset guest emails when candidate email changes
  useEffect(() => {
    if (candidateEmail) {
      setGuestEmails([candidateEmail]);
    }
  }, [candidateEmail]);

  // Add guest email
  const addEmail = (email: string) => {
    const trimmed = email.trim();
    if (
      trimmed &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) &&
      !guestEmails.includes(trimmed)
    ) {
      setGuestEmails((prev) => [...prev, trimmed]);
    }
  };

  const handleAddGuest = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", " ", ","].includes(e.key)) {
      e.preventDefault();
      addEmail(e.currentTarget.value);
      e.currentTarget.value = "";
    }
  };

  const handlePasteGuests = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const emails = pasted.split(/[\s,;]+/).filter(Boolean);
    emails.forEach(addEmail);
  };

  const handleRemoveGuest = (email: string) => {
    if (email === candidateEmail) return;
    setGuestEmails(guestEmails.filter((g) => g !== email));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.date || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please provide date and time for the interview",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title) {
      toast({
        title: "Missing Information",
        description: "Please provide a title for the interview",
        variant: "destructive",
      });
      return;
    }

    if (!unitProfileId || !candidateProfileId) {
      toast({
        title: "Error",
        description: "Missing profile information. Please try again.",
        variant: "destructive",
      });
      console.error("Missing IDs:", { unitProfileId, candidateProfileId });
      return;
    }

    setIsLoading(true);

    try {
      const scheduledDate = new Date(
        `${formData.date}T${formData.time}:00Z`
      ).toISOString();

      console.log("📩 Interview Submission Details:", {
        applicationId,
        candidateName,
        candidateEmail,
        guestEmails,
        scheduledDate,
        title: formData.title,
        description: formData.description,
        durationMinutes: 60,
        senderEmail,
        unitProfileId,
        candidateProfileId,
      });

      // Step 1: Call edge function to create Zoom meeting and send emails
      console.log("🔄 Calling edge function to create Zoom meeting...");
      const { data: zoomData, error: zoomError } =
        await supabase.functions.invoke("schedule-interview", {
          body: {
            applicationId,
            candidateName,
            candidateEmail: guestEmails, // Array of all guest emails
            scheduledDate,
            title: formData.title,
            description: formData.description,
            durationMinutes: 60,
            senderEmail,
          },
        });

      if (zoomError) {
        console.error("Zoom function error:", zoomError);
        throw zoomError;
      }

      console.log("✅ Zoom meeting created:", zoomData);

      // Extract meeting link from response
      const meetingLink =
        zoomData?.meetingLink || zoomData?.join_url || zoomData?.zoomLink || "";

      if (!meetingLink) {
        throw new Error("Failed to generate meeting link from Zoom");
      }

      console.log("🔗 Meeting link:", meetingLink);

      // Step 2: Store interview in database with profile IDs
      console.log("💾 Storing interview in database...");
      const { error: dbError } = await createInterview({
        applicationId,
        scheduledDate,
        meetingLink,
        title: formData.title,
        description: formData.description || "",
        durationMinutes: 60,
        unitId: unitProfileId,
        studentId: candidateProfileId,
      });

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error(dbError);
      }

      console.log("✅ Interview stored in database");

      toast({
        title: "Interview Scheduled",
        description: `Zoom meeting link has been sent to ${candidateName} and all guests`,
      });

      onOpenChange(false);
      onSuccess?.();

      // Reset fields
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        meetingType: "zoom",
      });
      setGuestEmails(candidateEmail ? [candidateEmail] : []);
    } catch (error: any) {
      console.error("❌ Error scheduling interview:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to schedule interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Schedule Interview
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* Sender Email (view only) */}
          {senderEmail && (
            <div className="space-y-1">
              <Label className="text-sm text-gray-700">Host Email</Label>
              <Input
                value={senderEmail}
                disabled
                className="h-11 bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm text-gray-700">
              Add title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Technical Interview - Software Engineer"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="h-11"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm text-gray-700">
              Add description
            </Label>
            <Textarea
              id="description"
              placeholder="Description of the meeting"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Guests */}
          <div className="space-y-2">
            <Label htmlFor="guests" className="text-sm text-gray-700">
              Add guests
            </Label>
            <div className="flex flex-wrap items-center gap-2 border rounded-lg p-2 min-h-[44px] focus-within:ring-2 focus-within:ring-purple-500">
              {guestEmails.map((email) => (
                <span
                  key={email}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                    email === candidateEmail
                      ? "bg-gray-200 text-gray-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {email}
                  {email !== candidateEmail && (
                    <button
                      onClick={() => handleRemoveGuest(email)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}

              <input
                id="guests"
                type="email"
                placeholder="Add guest email..."
                onKeyDown={handleAddGuest}
                onPaste={handlePasteGuests}
                className="flex-1 border-none outline-none bg-transparent text-sm p-1 min-w-[150px]"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm text-gray-700">
                Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm text-gray-700">
                Time <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Meeting Type */}
          <div className="space-y-3">
            <Label className="text-sm text-gray-700">Meeting Link</Label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, meetingType: "zoom" })
                }
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200"
              >
                <div className="w-6 h-6 bg-[#2196F3] rounded flex items-center justify-center">
                  <Video className="w-4 h-4 text-white fill-current" />
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  Add Zoom Meet video conferencing
                </span>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !unitProfileId || !candidateProfileId}
              className="bg-[#2196F3] rounded-full text-white px-8 h-11 hover:bg-[#1976D2] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Scheduling..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
