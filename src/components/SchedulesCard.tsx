import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScheduleEvent {
  id: string;
  name: string;
  avatarUrl?: string;
  color: string;
}

interface DaySchedule {
  dayName: string;
  date: number;
  events: ScheduleEvent[];
}

interface ScheduleEventCardProps {
  event: ScheduleEvent;
}

const ScheduleEventCard = ({ event }: ScheduleEventCardProps) => {
  return (
    <div
      className={`${event.color} rounded-full px-3 py-1.5 flex items-center gap-2 mb-2`}
    >
      {event.avatarUrl && (
        <div className="w-5 h-5 rounded-full bg-white overflow-hidden flex-shrink-0">
          <img
            src={event.avatarUrl}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <span className="text-xs font-medium text-white truncate">
        {event.name}
      </span>
    </div>
  );
};

interface DayCardProps {
  day: DaySchedule;
  isToday?: boolean;
}

const DayCard = ({ day, isToday }: DayCardProps) => {
  return (
    <div
      className={`rounded-2xl p-4 min-h-[300px] ${
        isToday ? "bg-blue-50 border-2 border-blue-200" : "bg-gray-50"
      }`}
    >
      {/* Day Header */}
      <div className="text-center mb-4">
        <p className="text-xs font-medium text-gray-600">{day.dayName}</p>
        <p className="text-2xl font-bold text-gray-900">{day.date}</p>
      </div>

      {/* Events */}
      <div className="space-y-2">
        {day.events.length > 0 ? (
          day.events.map((event) => (
            <ScheduleEventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="text-center text-gray-400 text-xs mt-8">
            No events
          </div>
        )}
      </div>
    </div>
  );
};

export default function SchedulesCard() {
  // Hard-coded data - replace with API call in the future
  // const { data: scheduleData, isLoading } = useScheduleData();

  const HARD_CODED_SCHEDULE: DaySchedule[] = [
    {
      dayName: "Sunday",
      date: 25,
      events: [],
    },
    {
      dayName: "Monday",
      date: 26,
      events: [
        {
          id: "1",
          name: "Pankaj Sharma",
          avatarUrl: "https://i.pravatar.cc/150?img=1",
          color: "bg-blue-500",
        },
      ],
    },
    {
      dayName: "Tuesday",
      date: 27,
      events: [
        {
          id: "2",
          name: "Pankaj Sharma",
          avatarUrl: "https://i.pravatar.cc/150?img=2",
          color: "bg-blue-500",
        },
        {
          id: "3",
          name: "Roopan Singh",
          avatarUrl: "https://i.pravatar.cc/150?img=3",
          color: "bg-blue-600",
        },
      ],
    },
    {
      dayName: "Wednesday",
      date: 28,
      events: [],
    },
    {
      dayName: "Thursday",
      date: 29,
      events: [],
    },
    {
      dayName: "Friday",
      date: 30,
      events: [],
    },
    {
      dayName: "Saturday",
      date: 31,
      events: [],
    },
  ];

  const currentWeekRange = "Jan 25 - Jan 31, 2026";
  const todayDate = 26; // Hardcoded for demo

  const scheduleData = useMemo(() => {
    return HARD_CODED_SCHEDULE.map((day) => ({
      ...day,
      isToday: day.date === todayDate,
    }));
  }, []);

  const handlePreviousWeek = () => {
    // TODO: Implement navigation to previous week
    console.log("Previous week");
  };

  const handleNextWeek = () => {
    // TODO: Implement navigation to next week
    console.log("Next week");
  };

  return (
    <div>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Schedules</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePreviousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xl font-semibold text-black-700 min-w-[180px] text-center">
            {currentWeekRange}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next week"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-4">
        {scheduleData.map((day) => (
          <DayCard key={day.date} day={day} isToday={day.isToday} />
        ))}
      </div>
    </div>
  );
}