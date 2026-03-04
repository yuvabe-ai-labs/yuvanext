import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, MapPin, Search, Video } from "lucide-react";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import ScheduleInterviewDialog from "@/components/ScheduleInterviewDialog";
import { useToast } from "@/hooks/use-toast";
import {
  useCancelMeeting,
  useCreateMeeting,
  useMeetings,
} from "@/hooks/useMeetingsManagement";
import { useSession } from "@/lib/auth-client";
import type { Meeting, MeetingPurpose } from "@/types/meetings.types";

const PURPOSE_LABELS: Record<MeetingPurpose, string> = {
  weekly_check_in: "Weekly Check-in",
  progress_review: "Progress Review",
  mid_point_evaluation: "Mid Point Evaluation",
  final_assessment: "Final Assessment",
  other: "Other",
};

const PURPOSE_BADGE_STYLES: Record<MeetingPurpose, string> = {
  weekly_check_in: "bg-[#EAB308] text-white",
  progress_review: "bg-[#FB923C] text-white",
  mid_point_evaluation: "bg-[#EC4899] text-white",
  final_assessment: "bg-[#34D399] text-white",
  other: "bg-[#64748B] text-white",
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const getWeekStartSunday = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const toDayKey = (date: Date) => format(date, "yyyy-MM-dd");

const meetingDate = (meeting: Meeting) => new Date(meeting.scheduledAt);

const formatMeetingDateLabel = (date: Date) => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (isSameDay(date, today)) {
    return `Today, ${format(date, "MMMM d, yyyy 'at' h:mmaaa")}`;
  }

  if (isSameDay(date, tomorrow)) {
    return `Tomorrow, ${format(date, "MMMM d, yyyy 'at' h:mmaaa")}`;
  }

  return format(date, "MMMM d, yyyy 'at' h:mmaaa");
};

const inferPurposeFromText = (text: string): MeetingPurpose => {
  const normalized = text.toLowerCase();

  if (normalized.includes("mid point") || normalized.includes("midpoint")) {
    return "mid_point_evaluation";
  }
  if (normalized.includes("final")) {
    return "final_assessment";
  }
  if (normalized.includes("progress")) {
    return "progress_review";
  }
  if (normalized.includes("weekly") || normalized.includes("check")) {
    return "weekly_check_in";
  }
  return "other";
};

const ScheduledMeetings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: session } = useSession();

  const [displayDate, setDisplayDate] = useState(new Date());
  const [searchValue, setSearchValue] = useState("");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const weekStart = useMemo(
    () => getWeekStartSunday(displayDate),
    [displayDate],
  );

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, idx) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + idx);
      return date;
    });
  }, [weekStart]);

  useEffect(() => {
    setSelectedDayKey(null);
  }, [weekStart]);

  const { data: meetingsData, isLoading } = useMeetings({
    search: searchValue || undefined,
    page: 1,
    limit: 100,
  });

  const createMeetingMutation = useCreateMeeting();
  const cancelMeetingMutation = useCancelMeeting();

  const meetingsList = useMemo(() => {
    if (Array.isArray(meetingsData)) {
      return meetingsData;
    }
    return meetingsData?.data ?? [];
  }, [meetingsData]);

  const scheduledMeetings = useMemo(
    () => meetingsList.filter((meeting) => meeting.status !== "cancelled"),
    [meetingsList],
  );

  const currentWeekLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  }, [weekDays]);

  const meetingsForBottomSection = useMemo(() => {
    let items = scheduledMeetings;
    if (selectedDayKey) {
      items = items.filter((meeting) => {
        return toDayKey(meetingDate(meeting)) === selectedDayKey;
      });
    }
    return [...items].sort(
      (a, b) => meetingDate(a).getTime() - meetingDate(b).getTime(),
    );
  }, [scheduledMeetings, selectedDayKey]);

  const selectedDayMeetingForDialog = useMemo(() => {
    if (selectedDayKey) {
      const dayItems = scheduledMeetings.filter(
        (meeting) => toDayKey(meetingDate(meeting)) === selectedDayKey,
      );
      if (dayItems.length > 0) {
        return dayItems[0];
      }
    }
    return scheduledMeetings[0];
  }, [scheduledMeetings, selectedDayKey]);

  const getMeetingsByDay = (day: Date) => {
    const dayKey = toDayKey(day);
    return scheduledMeetings.filter(
      (meeting) => toDayKey(meetingDate(meeting)) === dayKey,
    );
  };

  const handleDayCardClick = (day: Date) => {
    const key = toDayKey(day);
    setSelectedDayKey((prev) => (prev === key ? null : key));
  };

  const handleScheduleMeeting = async ({
    title,
    description,
    date,
    time,
  }: {
    title: string;
    description: string;
    date: string;
    time: string;
    guestEmails: string[];
  }) => {
    const candidateId =
      selectedDayMeetingForDialog?.candidate?.userId ||
      selectedDayMeetingForDialog?.candidateId;

    if (!candidateId) {
      throw new Error(
        "No candidate available to schedule. Select a day with candidate meetings first.",
      );
    }

    const combinedText = `${title} ${description}`.trim();
    const purpose = inferPurposeFromText(combinedText);
    const meetingType =
      combinedText.toLowerCase().includes("in person") ||
      combinedText.toLowerCase().includes("in-person")
        ? "in_person"
        : "zoom";

    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    const mentorId = session?.user?.id;

    await createMeetingMutation.mutateAsync({
      candidateId,
      mentorId,
      purpose,
      meetingType,
      scheduledAt,
      description: description || undefined,
      durationMinutes: 30,
      location: meetingType === "in_person" ? "TBD" : undefined,
    });
  };

  const handleCancelMeeting = async (meetingId: string) => {
    const cancellationReason = window.prompt(
      "Please provide a reason for cancellation:",
      "Cancelled by mentor",
    );

    if (!cancellationReason) {
      return;
    }

    await cancelMeetingMutation.mutateAsync({
      meetingId,
      cancellationReason,
    });
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    if (meeting.meetingType === "zoom" && meeting.zoomJoinUrl) {
      window.open(meeting.zoomJoinUrl, "_blank", "noopener,noreferrer");
      return;
    }
    toast({
      title: "Meeting Link Unavailable",
      description:
        meeting.meetingType === "in_person"
          ? "This is an in-person meeting."
          : "Join link is not available yet.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* <Navbar /> */}

      <div className="w-full mx-auto px-4 sm:px-8 lg:px-24 py-6 lg:py-10">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <h1 className="text-4xl md:text-3xl font-semibold text-[#3E4B5B] text-center">
            Scheduled Meetings
          </h1>

          <Button
            onClick={() => setIsScheduleOpen(true)}
            className="rounded-full bg-[#0B7A87] hover:bg-[#086974] text-white"
            disabled={createMeetingMutation.isPending}
          >
            + Schedule Meeting
          </Button>
        </div>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl md:text-2xl font-semibold text-[#3E4B5B]">
              Weekly Schedule
            </h2>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setDisplayDate((prev) => {
                    const next = new Date(prev);
                    next.setDate(prev.getDate() - 7);
                    return next;
                  })
                }
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <p className="text-2xl font-semibold text-[#3E4B5B] min-w-[240px] text-center">
                {currentWeekLabel}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setDisplayDate((prev) => {
                    const next = new Date(prev);
                    next.setDate(prev.getDate() + 7);
                    return next;
                  })
                }
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const dayKey = toDayKey(day);
              const dayMeetings = getMeetingsByDay(day);
              const isSelected = selectedDayKey === dayKey;
              return (
                <Card
                  key={day.toISOString()}
                  className={`rounded-3xl border cursor-pointer transition-colors ${
                    isSelected
                      ? "border-[#2563EB] bg-[#EFF6FF]"
                      : "border-gray-200 bg-white"
                  }`}
                  onClick={() => handleDayCardClick(day)}
                >
                  <CardContent className="p-4 min-h-[220px]">
                    <p className="text-xs text-center text-muted-foreground">
                      {DAY_NAMES[day.getDay()]}
                    </p>
                    <p className="text-3xl md:text-2xl text-center font-semibold mb-4 text-[#3E4B5B]">
                      {day.getDate()}
                    </p>

                    <div className="space-y-2">
                      {dayMeetings.map((meeting) => (
                        <div
                          key={meeting.id}
                          className="w-full rounded-full bg-[#2563EB] text-white text-xs px-2 py-1 flex items-center gap-1.5"
                        >
                          <Avatar className="w-4 h-4">
                            <AvatarImage
                              src={meeting.candidate?.avatarUrl || undefined}
                            />
                            <AvatarFallback>
                              {(meeting.candidate?.name || "M").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">
                            {meeting.candidate?.name || "Mentee"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <div className="border-t border-gray-200 mb-8" />

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl md:text-2xl font-semibold text-[#3E4B5B]">
              Upcoming Meetings
            </h2>
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search by names"
                className="rounded-full pl-9"
              />
            </div>
          </div>

          {selectedDayKey && (
            <p className="text-sm text-muted-foreground mb-4">
              Showing meetings for{" "}
              <span className="font-medium text-[#1F2937]">
                {format(new Date(selectedDayKey), "EEEE, MMM d, yyyy")}
              </span>
              . Click the same day card again to view all meetings.
            </p>
          )}

          {isLoading ? (
            <Card className="rounded-3xl">
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading meetings...
              </CardContent>
            </Card>
          ) : meetingsForBottomSection.length === 0 ? (
            <Card className="rounded-3xl">
              <CardContent className="p-8 text-center text-muted-foreground">
                No meetings found.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {meetingsForBottomSection.map((meeting) => {
                const candidateName = meeting.candidate?.name || "Mentee";
                const summary =
                  meeting.candidate?.profileSummary ||
                  meeting.description ||
                  "No meeting description available.";
                const date = meetingDate(meeting);

                return (
                  <Card key={meeting.id} className="rounded-3xl border">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage
                              src={meeting.candidate?.avatarUrl || undefined}
                            />
                            <AvatarFallback>
                              {candidateName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-xl font-semibold text-[#111827]">
                              {candidateName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {meeting.candidate?.email || "YuvaNext"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${PURPOSE_BADGE_STYLES[meeting.purpose]}`}
                        >
                          {PURPOSE_LABELS[meeting.purpose]}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground leading-7">
                        {summary}
                      </p>

                      <div className="flex items-center gap-2 text-[#3E4B5B]">
                        {meeting.meetingType === "zoom" ? (
                          <Video className="w-4 h-4 text-[#2563EB]" />
                        ) : (
                          <MapPin className="w-4 h-4 text-[#2563EB]" />
                        )}
                        <span className="text-sm">
                          {meeting.meetingType === "zoom"
                            ? "Online on "
                            : "In-person on "}
                          <span className="font-semibold">
                            {formatMeetingDateLabel(date)}
                          </span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="rounded-full border-red-300 text-red-500 hover:text-red-600"
                          onClick={() => handleCancelMeeting(meeting.id)}
                          disabled={cancelMeetingMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="rounded-full bg-[#2563EB] hover:bg-[#1d4ed8]"
                          onClick={() => handleJoinMeeting(meeting)}
                        >
                          Join
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <ScheduleInterviewDialog
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        candidateName={selectedDayMeetingForDialog?.candidate?.name || "Mentee"}
        applicationId={selectedDayMeetingForDialog?.id || "mentor-meeting"}
        onSuccess={() => {}}
        onSchedule={handleScheduleMeeting}
      />
    </div>
  );
};

export default ScheduledMeetings;
