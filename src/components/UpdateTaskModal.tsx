import { X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateTask, useDeleteTask } from "@/hooks/useCandidateTasks";
import { Task, TaskStatus } from "@/types/candidateTasks.types";
import { updateTaskSchema } from "@/lib/schemas";
import type { UpdateTaskPayload } from "@/types/candidateTasks.types";
import { toast } from "sonner";

interface UpdateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

const COLORS = [
  "#F97316",
  "#10B981",
  "#0EA5E9",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#F59E0B",
];

type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;

export default function UpdateTaskModal({
  isOpen,
  onClose,
  task,
}: UpdateTaskModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize hooks with applicationId for cache invalidation
  const updateTaskMutation = useUpdateTask(task.taskId);
  const deleteTaskMutation = useDeleteTask(task.taskId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UpdateTaskFormData>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      startDate: task.taskStartDate || "",
      endDate: task.taskEndDate || "",
      color: task.taskColor || COLORS[0],
      note: task.taskDescription || "",
      submissionLink: task.taskSubmissionLink || "",
    },
  });

  const selectedColor = watch("color");
  const startDate = watch("startDate");

  useEffect(() => {
    if (task && isOpen) {
      reset({
        startDate: task.taskStartDate || "",
        endDate: task.taskEndDate || "",
        color: task.taskColor || COLORS[0],
        note: task.taskDescription || "",
        submissionLink: task.taskSubmissionLink || "",
      });
    }
  }, [task, reset, isOpen]);

  const onSubmit = async (data: UpdateTaskFormData) => {
    try {
      // Auto-update status to submitted if a link is provided
      const newStatus = data.submissionLink?.trim()
        ? TaskStatus.SUBMITTED
        : task.taskStatus;

      const payload: UpdateTaskPayload = {
        taskTitle: task.taskTitle,
        taskStartDate: data.startDate || null,
        taskEndDate: data.endDate || null,
        taskColor: data.color || null,
        taskDescription: data.note?.trim() || null,
        taskSubmissionLink: data.submissionLink?.trim() || null,
        taskStatus: newStatus,
      };

      await updateTaskMutation.mutateAsync({
        taskId: task.taskId,
        payload,
      });

      toast.success(
        newStatus === TaskStatus.SUBMITTED ? "Task submitted!" : "Changes saved"
      );
      onClose();
    } catch (error) {
      toast.error("Failed to update task.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTaskMutation.mutateAsync(task.taskId);
      toast.success("Task deleted");
      onClose();
    } catch (error) {
      toast.error("Delete failed.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-xl">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
              >
                <Trash2 size={20} />
              </button>
              <h2 className="text-2xl font-semibold text-gray-800 truncate max-w-[280px]">
                {task.taskTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800 mb-3">
                Delete this task permanently?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-white border rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  {...register("startDate")}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <input
                  type="date"
                  {...register("endDate")}
                  min={startDate}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Theme Color</label>
              <div className="flex justify-between">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue("color", color)}
                    className={`w-8 h-8 rounded-full ${
                      selectedColor === color
                        ? "ring-2 ring-gray-400 scale-110"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                {...register("note")}
                rows={3}
                className="w-full px-4 py-3 border rounded-xl resize-none"
                placeholder="Task details..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Submission Link</label>
              <input
                type="text"
                {...register("submissionLink")}
                className="w-full px-4 py-3 border rounded-xl"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              disabled={updateTaskMutation.isPending}
              className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 disabled:opacity-50"
            >
              {updateTaskMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
