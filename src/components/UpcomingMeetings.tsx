// components/UpcomingMeetings.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { differenceInCalendarDays, format, isToday, isTomorrow } from "date-fns";
import { MapPin, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UnitIcon } from "@/components/ui/custom-icons";
import { useMeetings } from "@/hooks/useMeetingsManagement";
import type { Meeting, MeetingPurpose } from "@/types/meetings.types";

const MAX_ROWS = 3;

const PURPOSE_LABELS: Record<MeetingPurpose, string> = {
  weekly_check_in: "Weekly Check-in",
  progress_review: "Progress Review",
  mid_point_evaluation: "Mid Point Evaluation",
  final_assessment: "Final Assessment",
  other: "Other",
};

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "M";

/** "Today, 2:00 PM" · "Tomorrow, 9:30 AM" · "Wed, 10:00 AM" · "12 Sep, 3:00 PM" */
const formatWhen = (date: Date) => {
  const time = format(date, "h:mm a");
  if (isToday(date)) return `Today, ${time}`;
  if (isTomorrow(date)) return `Tomorrow, ${time}`;
  if (differenceInCalendarDays(date, new Date()) < 7)
    return `${format(date, "EEE")}, ${time}`;
  return `${format(date, "dd MMM")}, ${time}`;
};

export default function UpcomingMeetings() {
  const navigate = useNavigate();
  const { data, isLoading } = useMeetings({
    status: "pending",
    page: 1,
    limit: 50,
  });

  const meetings = useMemo(() => {
    const now = Date.now();
    return (data?.data ?? [])
      .filter((meeting: Meeting) => {
        const at = new Date(meeting.scheduledAt).getTime();
        return !Number.isNaN(at) && at >= now;
      })
      .sort(
        (a: Meeting, b: Meeting) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      )
      .slice(0, MAX_ROWS);
  }, [data]);

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">Upcoming Meetings</h2>
        <button
          onClick={() => navigate("/scheduled-meetings")}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          View all
        </button>
      </div>

      <div className="mt-2">
        {isLoading ? (
          <div className="space-y-4 py-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">
            No upcoming meetings scheduled.
          </p>
        ) : (
          meetings.map((meeting: Meeting) => {
            const name = meeting.candidate?.name || "Unknown Mentee";
            const scheduledAt = new Date(meeting.scheduledAt);
            const isZoom = meeting.meetingType === "zoom";
            // Prefer the unit the mentee belongs to; fall back to the venue.
            const subtitle =
              meeting.unitName ||
              (isZoom ? "Zoom meeting" : meeting.location || "In person");

            return (
              <button
                key={meeting.id}
                onClick={() => navigate("/scheduled-meetings")}
                className="flex w-full items-center gap-4 border-b border-gray-100 py-5 text-left last:border-b-0 hover:bg-gray-50/60"
              >
                <Avatar className="h-14 w-14 shrink-0 ring-2 ring-blue-500 ring-offset-2">
                  <AvatarImage
                    src={meeting.candidate?.avatarUrl ?? undefined}
                    alt={name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-200 font-semibold text-gray-700">
                    {initialsOf(name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold text-gray-900">
                    {name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    {meeting.unitName ? (
                      <UnitIcon className="shrink-0 text-gray-500" />
                    ) : isZoom ? (
                      <Video className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    ) : (
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    )}
                    <span className="truncate text-sm text-gray-500">
                      {subtitle}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {formatWhen(scheduledAt)}
                  </p>
                  <span className="mt-2 inline-block rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600">
                    {PURPOSE_LABELS[meeting.purpose] ?? "Meeting"}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
