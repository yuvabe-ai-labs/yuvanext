import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  startOfDay,
} from "date-fns";
import type { StudentTask } from "@/types/studentTasks.types";

interface TaskCalendarProps {
  tasks: StudentTask[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: "month" | "week";
  onTaskClick: (task: StudentTask) => void;
  onAddTaskClick: () => void;
  hideAddButton?: boolean;
}

export default function TaskCalendar({
  tasks,
  currentDate,
  onDateChange,
  viewMode,
  onTaskClick,
  onAddTaskClick,
  hideAddButton = false,
}: TaskCalendarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const getTasksForDay = (day: Date) => {
    const isSunday = day.getDay() === 0;

    if (isSunday) {
      return [];
    }

    return tasks.filter((task) => {
      if (!task.start_date || !task.end_date) return false;

      const taskStart = startOfDay(new Date(task.start_date));
      const taskEnd = startOfDay(new Date(task.end_date));
      const dayToCheck = startOfDay(day);

      return (
        dayToCheck.getTime() >= taskStart.getTime() &&
        dayToCheck.getTime() <= taskEnd.getTime()
      );
    });
  };

  // Convert time string to percentage of day (0-100)
  const timeToPercentage = (time: string | null): number => {
    if (!time) return 0;
    try {
      const [hours, minutes] = time.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes;
      return (totalMinutes / 1440) * 100; // 1440 minutes in a day
    } catch {
      return 0;
    }
  };

  const renderTaskBar = (
    task: StudentTask,
    day: Date,
    dayTasks: StudentTask[]
  ) => {
    if (!task.start_date || !task.end_date) return null;

    const taskStart = startOfDay(new Date(task.start_date));
    const taskEnd = startOfDay(new Date(task.end_date));
    const currentDay = startOfDay(day);

    const isStartDay = currentDay.getTime() === taskStart.getTime();
    const isEndDay = currentDay.getTime() === taskEnd.getTime();
    const isMiddleDay =
      currentDay.getTime() > taskStart.getTime() &&
      currentDay.getTime() < taskEnd.getTime();

    if (!isStartDay && !isMiddleDay && !isEndDay) return null;

    const taskIndex = dayTasks.findIndex((t) => t.id === task.id);

    // Calculate positioning based on time (kept for layout)
    let leftOffset = 0;
    let rightOffset = 0;
    let borderRadius = "";

    if (isStartDay && isEndDay) {
      leftOffset = timeToPercentage(task.start_time);
      rightOffset = 100 - timeToPercentage(task.end_time);
      borderRadius = "rounded-full";
    } else if (isStartDay) {
      leftOffset = timeToPercentage(task.start_time);
      rightOffset = 0;
      borderRadius = "rounded-l-full";
    } else if (isEndDay) {
      leftOffset = 0;
      rightOffset = 100 - timeToPercentage(task.end_time);
      borderRadius = "rounded-r-full";
    } else {
      leftOffset = 0;
      rightOffset = 0;
    }

    // Tooltip only shows task title now
    return (
      <div
        key={task.id}
        className="relative w-full"
        style={{
          marginTop: taskIndex > 0 ? "4px" : "0",
        }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            onTaskClick(task);
          }}
          className={`text-xs text-white py-2 cursor-pointer hover:opacity-90 transition-opacity ${borderRadius} min-h-[28px] flex items-center -mx-px absolute`}
          style={{
            backgroundColor: task.color || "#3B82F6",
            left: `${leftOffset}%`,
            right: `${rightOffset}%`,
            paddingLeft: isStartDay ? "12px" : "4px",
            paddingRight: isEndDay ? "12px" : "4px",
          }}
          title={task.title}
        >
          {isStartDay ? (
            <span className="truncate font-medium">{task.title}</span>
          ) : (
            <span>&nbsp;</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-gray-200">
        <div className="flex items-center gap-4 mx-auto w-[200px] justify-center">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>

          <h2 className="text-lg font-semibold text-gray-800 text-center">
            {format(currentDate, "MMMM")}
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Add Task button aligned right */}
        {!hideAddButton && (
          <button
            onClick={onAddTaskClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-full hover:bg-teal-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add Task
          </button>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-3xl overflow-hidden border border-gray-200">
          {/* Week Day Headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="bg-gray-200 text-center text-md font-semibold text-gray-600 py-8"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={index}
                className={`min-h-[100px] pt-2 pb-2 ${
                  !isCurrentMonth ? "bg-gray-50" : "bg-white"
                } relative`}
              >
                <div
                  className={`w-full flex items-center justify-center text-gray-300 font-semibold text-md mb-1`}
                >
                  {isToday ? (
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center mx-auto font-semibold text-md">
                      {format(day, "d")}
                    </div>
                  ) : (
                    format(day, "d")
                  )}
                </div>
                <div className="relative" style={{ minHeight: "60px" }}>
                  {dayTasks.map((task) => renderTaskBar(task, day, dayTasks))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
