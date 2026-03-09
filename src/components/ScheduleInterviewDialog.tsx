import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Video, MonitorPlay, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateMeeting } from "@/hooks/useMeetingsManagement";
import type { MeetingPurpose, MeetingType } from "@/types/meetings.types";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  about?: string;
}

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidatesList?: Candidate[];
  mentorId?: string;
  onSuccess?: () => void;
}

const PURPOSE_OPTIONS: { value: MeetingPurpose; label: string }[] = [
  { value: "weekly_check_in", label: "Weekly Check-in" },
  { value: "progress_review", label: "Progress Review" },
  { value: "mid_point_evaluation", label: "Mid Point Evaluation" },
  { value: "final_assessment", label: "Final Assessment" },
  { value: "other", label: "Other" },
];

const ScheduleInterviewDialog: React.FC<ScheduleInterviewDialogProps> = ({
  open,
  onOpenChange,
  candidatesList = [],
  mentorId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const createMeetingMutation = useCreateMeeting();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const [about, setAbout] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetingPurpose, setMeetingPurpose] = useState<MeetingPurpose | "">("");

  const [meetingType, setMeetingType] = useState<"google_meet" | "zoom" | "in_person" | "">("");
  const [location, setLocation] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCandidates = candidatesList.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setSearchTerm(candidate.name);
    setEmail(candidate.email);
    setAbout(candidate.about || "");
    setIsDropdownOpen(false);
  };

  // --- Auto-select if only one candidate is passed (e.g., from Profile Page) ---
  useEffect(() => {
    if (open && candidatesList.length === 1 && !selectedCandidate) {
      handleSelectCandidate(candidatesList[0]);
    }
  }, [open, candidatesList, selectedCandidate]);

  // --- Front-End Validation Handlers ---
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    const day = selectedDate.getUTCDay(); // 0 is Sunday, 6 is Saturday
    
    if (day === 0 || day === 6) {
      toast({
        title: "Invalid Date",
        description: "Meetings can only be scheduled on weekdays (Mon-Fri).",
        variant: "destructive",
      });
      setDate(""); // Reset the field
    } else {
      setDate(e.target.value);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTime = e.target.value;
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      // Backend expects 09:00 AM to 5:00 PM (17:00)
      if (hours < 9 || hours > 17 || (hours === 17 && minutes > 0)) {
        toast({
          title: "Invalid Time",
          description: "Meetings must be scheduled between 09:00 AM and 05:00 PM.",
          variant: "destructive",
        });
        setTime(""); // Reset the field
        return;
      }
    }
    setTime(selectedTime);
  };

  // Get today's date in YYYY-MM-DD format for the min attribute
  const today = new Date().toISOString().split('T')[0];

  const resetForm = () => {
    setSearchTerm("");
    setSelectedCandidate(null);
    setAbout("");
    setEmail("");
    setMeetingPurpose("");
    setDate("");
    setTime("");
    setMeetingType("");
    setLocation("");
  };

  const handleSave = async () => {
    if (!selectedCandidate?.id) {
      toast({
        title: "Validation Error",
        description: "Please select a valid candidate from the dropdown.",
        variant: "destructive",
      });
      return;
    }

    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    const apiMeetingType: MeetingType = meetingType === "in_person" ? "in_person" : "zoom";

    try {
      await createMeetingMutation.mutateAsync({
        candidateId: selectedCandidate.id,
        mentorId,
        purpose: meetingPurpose as MeetingPurpose,
        meetingType: apiMeetingType,
        scheduledAt,
        description: about || undefined,
        durationMinutes: 30,
        location: meetingType === "in_person" ? location : undefined,
      });

      onOpenChange(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent className="max-w-md p-6 bg-white rounded-2xl border-0 shadow-lg gap-6">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-xl font-semibold text-[#1F2937]">Schedule Meeting</DialogTitle>
          <DialogClose className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </DialogClose>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1 relative" ref={dropdownRef}>
            <label className="text-sm text-gray-500">Candidate Name</label>
            <Input
              placeholder="Search or type name"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
                if (selectedCandidate && e.target.value !== selectedCandidate.name) {
                  setSelectedCandidate(null);
                }
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="rounded-xl border-gray-200"
            />
            {isDropdownOpen && filteredCandidates.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                {filteredCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                    onClick={() => handleSelectCandidate(candidate)}
                  >
                    {candidate.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-500">Meeting Purpose</label>
            <select
              value={meetingPurpose}
              onChange={(e) => setMeetingPurpose(e.target.value as MeetingPurpose)}
              className="flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Select meeting purpose</option>
              {PURPOSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-500">About the Candidate</label>
            <Textarea
              placeholder="Description of the candidate"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="rounded-xl border-gray-200 resize-none h-24"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-500">Email ID</label>
            <Input
              placeholder="Example: email@gmail.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-gray-200 bg-gray-50"
              readOnly
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-500">Date <span className="text-red-500">*</span></label>
              <Input
                type="date"
                min={today}
                value={date}
                onChange={handleDateChange}
                className="rounded-xl border-gray-200 text-gray-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-500">Time <span className="text-red-500">*</span></label>
              <Input
                type="time"
                min="09:00"
                max="17:00"
                value={time}
                onChange={handleTimeChange}
                className="rounded-xl border-gray-200 text-gray-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-sm text-gray-500">Meeting Link</label>

           

            <div
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${meetingType === 'zoom' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
              onClick={() => setMeetingType('zoom')}
            >
              <MonitorPlay className={`w-5 h-5 ${meetingType === 'zoom' ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-600">Add Zoom Meeting video conferencing</span>
            </div>

            <div
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${meetingType === 'in_person' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
              onClick={() => setMeetingType('in_person')}
            >
              <MapPin className={`w-5 h-5 ${meetingType === 'in_person' ? 'text-gray-800' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-600">In-person Meeting</span>
            </div>
          </div>

          {meetingType === "in_person" && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
              <label className="text-sm text-gray-500">Location</label>
              <Input
                placeholder="Enter office address or meeting room"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-xl border-gray-200"
              />
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              className="rounded-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-8"
              disabled={!selectedCandidate || !meetingPurpose || !date || !time || !meetingType || (meetingType === "in_person" && !location.trim()) || createMeetingMutation.isPending}
            >
              {createMeetingMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleInterviewDialog;