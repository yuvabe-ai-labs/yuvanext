import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import { useSession } from "@/lib/auth-client";
import { useCandidateTasks } from "@/hooks/useCandidateTasks";
import TaskCalendar from "@/components/TaskCalendar";
import AddTaskModal from "@/components/AddTaskModal";
import UpdateTaskModal from "@/components/UpdateTaskModal";
import type { Task } from "@/types/candidateTasks.types";
import { Badge } from "@/components/ui/badge";

export default function MyTasks() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { data: session } = useSession();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const { data: tasks = [], isLoading } = useCandidateTasks(
    applicationId || ""
  );

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsUpdateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedTask(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500";
      case "redo":
        return "bg-orange-500";
      case "submitted":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "accepted":
        return "Accepted";
      case "redo":
        return "Needs Redo";
      case "submitted":
        return "Submitted";
      default:
        return "Pending";
    }
  };

  if (!applicationId) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <p className="text-gray-600">Invalid application ID</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] min-h-[calc(100vh-80px)] gap-20">
          {/* Calendar Section */}
          <div>
            <button
              className="mb-4 mt-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 
              border border-gray-300 rounded-lg px-3 py-1.5 bg-white w-fit"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>

            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
              </div>
            ) : (
              <TaskCalendar
                tasks={tasks}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                viewMode={viewMode}
                onTaskClick={handleTaskClick}
                onAddTaskClick={() => setIsAddModalOpen(true)}
              />
            )}
          </div>

          {/* Remarks Sidebar */}
          <div className="w-full md:w-80 bg-white p-6 shadow-inner flex flex-col overflow-hidden border-l-4 border-gray-300">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex-shrink-0">
              Remarks
            </h2>

            {tasks.length === 0 ? (
              <div className="text-center py-12 flex-grow overflow-auto">
                <p className="text-gray-500 text-sm">
                  No tasks to show remarks for
                </p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto flex-grow pr-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="bg-white border border-gray-200 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className="w-4 h-1 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: task.color || "#3B82F6" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">
                            {task.title}
                          </h3>

                          <Badge
                            variant="secondary"
                            className={`${getStatusColor(
                              task.status
                            )} text-white text-[10px] px-2 py-0.5`}
                          >
                            {getStatusLabel(task.status)}
                          </Badge>
                        </div>

                        {task.endDate && (
                          <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full border-2 border-orange-400"></span>
                            Due on {format(new Date(task.endDate), "do MMMM")}
                          </p>
                        )}
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-xs text-gray-600 mb-3 leading-relaxed pl-7">
                        {task.description}
                      </p>
                    )}

                    {task.reviewRemarks && (
                      <div className="pl-7 mb-3">
                        <p className="text-[11px] font-medium text-gray-700 mb-1">
                          Remarks
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {task.reviewRemarks}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {session?.user?.id && (
        <AddTaskModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          applicationId={applicationId}
          studentId={session.user.id}
        />
      )}

      {selectedTask && (
        <UpdateTaskModal
          isOpen={isUpdateModalOpen}
          onClose={handleCloseModal}
          task={selectedTask}
        />
      )}
    </div>
  );
}
