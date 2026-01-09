import { useState } from "react";
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
import { useUpdateApplicationStatus } from "@/hooks/useCandidateProfile";

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  candidateEmail: string;
  applicationId: string;
  candidateProfileId: string; // Not strictly needed for API call but kept for interface compat
  onSuccess?: () => void;
}

export default function ScheduleInterviewDialog({
  open,
  onOpenChange,
  candidateName,
  candidateEmail,
  applicationId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  candidateProfileId,
  onSuccess,
}: ScheduleInterviewDialogProps) {
  const { toast } = useToast();

  // 1. USE MUTATION HOOK
  const updateStatusMutation = useUpdateApplicationStatus();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    meetingType: "zoom",
  });

  // Guest emails state (Backend might not support guests directly in this endpoint version,
  // but if notes support it, we can append there, or check if backend adds a guests field later)
  // For now, I'll assume we just notify the main candidate based on your API doc.
  const [guestEmails, setGuestEmails] = useState<string[]>([]);

  // Add/Remove Guest logic (Visual only for now unless API supports 'guests' field)
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

  const handleRemoveGuest = (email: string) => {
    setGuestEmails(guestEmails.filter((g) => g !== email));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.date || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please provide date and time",
        variant: "destructive",
      });
      return;
    }
    if (!formData.title) {
      toast({
        title: "Missing Information",
        description: "Please provide a title",
        variant: "destructive",
      });
      return;
    }

    try {
      const scheduledDate = new Date(
        `${formData.date}T${formData.time}:00`
      ).toISOString();

      // 2. CALL MUTATION
      // Backend expects: applicationId, status, interviewDetails
      updateStatusMutation.mutate(
        {
          applicationId,
          status: "interviewed",
          interviewDetails: {
            scheduledAt: scheduledDate,
            meetingLink: "zoom", // Backend generates link if provider is zoom
            notes: `${formData.description}\n\nGuests: ${guestEmails.join(
              ", "
            )}`, // Append guests to notes
            durationMinutes: 60,
            provider: "zoom",
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            onSuccess?.();
            // Reset form
            setFormData({
              title: "",
              description: "",
              date: "",
              time: "",
              meetingType: "zoom",
            });
            setGuestEmails([]);
          },
          onError: (error: any) => {
            // Error toast handled by global handler or custom logic here
            const msg =
              error.response?.data?.message || "Failed to schedule interview.";
            toast({ title: "Error", description: msg, variant: "destructive" });
          },
        }
      );
    } catch (error: any) {
      console.error("Error preparing submission:", error);
    }
  };

  const handleAddGuestKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", " ", ","].includes(e.key)) {
      e.preventDefault();
      addEmail(e.currentTarget.value);
      e.currentTarget.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Schedule Interview with {candidateName}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm text-gray-700">
              Interview Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Technical Interview"
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
              Description / Notes
            </Label>
            <Textarea
              id="description"
              placeholder="Agenda or notes..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Guests (Visual placeholder effectively, sent as notes) */}
          <div className="space-y-2">
            <Label htmlFor="guests" className="text-sm text-gray-700">
              Additional Guests (Emails)
            </Label>
            <div className="flex flex-wrap items-center gap-2 border rounded-lg p-2 min-h-[44px] focus-within:ring-2 focus-within:ring-purple-500">
              {guestEmails.map((email) => (
                <span
                  key={email}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-purple-100 text-purple-700"
                >
                  {email}
                  <button
                    onClick={() => handleRemoveGuest(email)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                id="guests"
                type="email"
                placeholder="Type & Enter..."
                onKeyDown={handleAddGuestKey}
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

          {/* Meeting Type Info */}
          <div className="space-y-3">
            <Label className="text-sm text-gray-700">Meeting Platform</Label>
            <div className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
              <div className="w-6 h-6 bg-[#2196F3] rounded flex items-center justify-center">
                <Video className="w-4 h-4 text-white fill-current" />
              </div>
              <span className="text-sm text-gray-600 font-medium">
                Zoom Meeting (Link auto-generated)
              </span>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmit}
              disabled={updateStatusMutation.isPending}
              className="bg-[#2196F3] rounded-full text-white px-8 h-11 hover:bg-[#1976D2]"
            >
              {updateStatusMutation.isPending
                ? "Scheduling..."
                : "Schedule Interview"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
