import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePendingMeetings } from "@/hooks/useMeetings"; // Import your new hook

interface ScheduleEvent {
  id: string;
  name: string;
  avatarUrl?: string;
  color: string;
}

interface DaySchedule {
  dayName: string;
  date: number;
  isToday: boolean;
  events: ScheduleEvent[];
}

const EVENT_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-pink-500",
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Helper components remain the same
const ScheduleEventCard = ({ event }: { event: ScheduleEvent }) => (
  <div className={`${event.color} rounded-full px-3 py-1.5 flex items-center gap-2 mb-2`}>
    {event.avatarUrl && (
      <div className="w-5 h-5 rounded-full bg-white overflow-hidden flex-shrink-0">
        <img src={event.avatarUrl} alt={event.name} className="w-full h-full object-cover" />
      </div>
    )}
    <span className="text-xs font-medium text-white truncate">{event.name}</span>
  </div>
);

const DayCard = ({ day }: { day: DaySchedule }) => (
  <div className={`rounded-2xl p-4 min-h-[300px] ${day.isToday ? "bg-blue-50 border-2 border-blue-200" : "bg-gray-50"}`}>
    <div className="text-center mb-4">
      <p className="text-xs font-medium text-gray-600">{day.dayName}</p>
      <p className="text-2xl font-bold text-gray-900">{day.date}</p>
    </div>
    <div className="space-y-2">
      {day.events.length > 0 ? (
        day.events.map((event) => <ScheduleEventCard key={event.id} event={event} />)
      ) : (
        <div className="text-center text-gray-400 text-xs mt-8">No events</div>
      )}
    </div>
  </div>
);

export default function SchedulesCard() {
  // 1. Fetch data from API
  const { data: responseData, isLoading } = usePendingMeetings();
  
  // Extract the actual array of meetings from the response
  const meetings = responseData?.data || [];

  // 2. Manage Calendar State (Start with today's date)
  const [currentDate, setCurrentDate] = useState(new Date());

  // 3. Calculate the 7 days of the currently viewed week
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    // Adjust to the previous Sunday
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  // 4. Map the API Meetings into the 7 calculated days
  const scheduleData: DaySchedule[] = useMemo(() => {
    const today = new Date();

    return weekDays.map((dayDate) => {
      // Find all meetings that match this specific day
      const dayEvents = meetings
        .filter((m: any) => {
          const mDate = new Date(m.scheduledAt);
          return (
            mDate.getDate() === dayDate.getDate() &&
            mDate.getMonth() === dayDate.getMonth() &&
            mDate.getFullYear() === dayDate.getFullYear()
          );
        })
        .map((m: any, index: number) => ({
          id: m.id,
          name: m.candidate?.name || "Unknown Mentee",
          avatarUrl: m.candidate?.avatarUrl,
          // Cycle through colors so it looks nice
          color: EVENT_COLORS[index % EVENT_COLORS.length], 
        }));

      return {
        dayName: DAY_NAMES[dayDate.getDay()],
        date: dayDate.getDate(),
        isToday: dayDate.toDateString() === today.toDateString(),
        events: dayEvents,
      };
    });
  }, [weekDays, meetings]);

  // 5. Generate Header String (e.g., "Feb 22 - Feb 28, 2026")
  const currentWeekRange = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    
    const startStr = `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}`;
    const endStr = `${MONTH_NAMES[end.getMonth()]} ${end.getDate()}`;
    return `${startStr} - ${endStr}, ${end.getFullYear()}`;
  }, [weekDays]);

  // 6. Navigation Handlers
  const handlePreviousWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  return (
    <div>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          Schedules
          {isLoading && <span className="text-sm text-gray-400 font-normal animate-pulse">Loading...</span>}
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePreviousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xl font-semibold text-gray-700 min-w-[200px] text-center">
            {currentWeekRange}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-4">
        {scheduleData.map((day) => (
          <DayCard key={`${day.date}-${day.dayName}`} day={day} />
        ))}
      </div>
    </div>
  );
}