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

// 1. Imports for RHF + Zod
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// 2. CHANGE: Import the Status Update Hook instead of Interview Mutation
import { useUpdateApplicationStatus } from "@/hooks/useCandidateProfile"; // Ensure this path matches where you keep this hook
import {
  ScheduleFormValues,
  scheduleInterviewSchema,
} from "@/lib/scheduleInterviewSchema";

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  candidateEmail?: string;
  applicationId: string;
  candidateProfileId?: string;
  unitId?: string;
  studentId?: string;
  onSuccess?: () => void;
}

export default function ScheduleInterviewDialog({
  open,
  onOpenChange,
  candidateName,
  applicationId,
  onSuccess,
}: ScheduleInterviewDialogProps) {
  const { toast } = useToast();

  // 3. USE THE STATUS UPDATE MUTATION
  const updateStatusMutation = useUpdateApplicationStatus();

  // Initialize Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleInterviewSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
    },
  });

  // Guest emails state
  const [guestEmails, setGuestEmails] = useState<string[]>([]);

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

  const handleAddGuestKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", " ", ","].includes(e.key)) {
      e.preventDefault();
      addEmail(e.currentTarget.value);
      e.currentTarget.value = "";
    }
  };

  // 4. Submit Handler
  const onSubmit = (data: ScheduleFormValues) => {
    // Combine Date & Time
    const scheduledDate = new Date(
      `${data.date}T${data.time}:00`
    ).toISOString();

    // Combine Description & Guests
    const fullDescription = `${
      data.description || ""
    }\n\nGuests: ${guestEmails.join(", ")}`.trim();

    // 5. CALL UPDATE STATUS MUTATION
    // We pass 'interviewed' status + the details object
    updateStatusMutation.mutate(
      {
        applicationId: applicationId,
        status: "interviewed",
        // This matches the endpoint structure
        interviewDetails: {
          title: data.title,
          description: fullDescription,
          scheduledDate: scheduledDate,
          durationMinutes: 60, // Default duration
          provider: "zoom", // Default provider
          // No need to pass meetingLink, backend generates it
        },
      } as any, // Cast to any if your type definition isn't fully updated yet
      {
        onSuccess: () => {
          toast({
            title: "Interview Scheduled",
            description: `Invitation sent to ${candidateName}`,
          });
          onOpenChange(false);
          onSuccess?.();
          reset();
          setGuestEmails([]);
        },
        onError: (error: any) => {
          toast({
            title: "Scheduling Failed",
            description:
              error?.response?.data?.message || "Could not schedule interview.",
            variant: "destructive",
          });
        },
      }
    );
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

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm text-gray-700">
              Interview Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Technical Interview"
              className="h-11"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm text-gray-700">
              Description / Notes
            </Label>
            <Textarea
              id="description"
              placeholder="Agenda or notes..."
              className="min-h-[100px] resize-none"
              {...register("description")}
            />
          </div>

          {/* Guests */}
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
                    type="button"
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
                  className="h-11 pl-10"
                  {...register("date")}
                />
              </div>
              {errors.date && (
                <p className="text-xs text-red-500">{errors.date.message}</p>
              )}
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
                  className="h-11 pl-10"
                  {...register("time")}
                />
              </div>
              {errors.time && (
                <p className="text-xs text-red-500">{errors.time.message}</p>
              )}
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
              type="submit"
              disabled={updateStatusMutation.isPending || isSubmitting}
              className="bg-[#2196F3] rounded-full text-white px-8 h-11 hover:bg-[#1976D2]"
            >
              {updateStatusMutation.isPending
                ? "Scheduling..."
                : "Schedule Interview"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
