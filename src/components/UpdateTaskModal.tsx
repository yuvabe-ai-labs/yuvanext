import { X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateTask, useDeleteTask } from "@/hooks/useCandidateTasks";
import type { Task } from "@/types/candidateTasks.types";
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

  const updateTaskMutation = useUpdateTask(task.applicationId);
  const deleteTaskMutation = useDeleteTask(task.applicationId);

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
      startDate: task.startDate || "",
      endDate: task.endDate || "",
      color: task.color || COLORS[0],
      note: task.description || "",
      submissionLink: task.submissionLink || "",
    },
  });

  const selectedColor = watch("color");
  const startDate = watch("startDate");

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      reset({
        startDate: task.startDate || "",
        endDate: task.endDate || "",
        color: task.color || COLORS[0],
        note: task.description || "",
        submissionLink: task.submissionLink || "",
      });
    }
  }, [task, reset]);

  const onSubmit = async (data: UpdateTaskFormData) => {
    try {
      const payload: UpdateTaskPayload = {
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        color: data.color || null,
        description: data.note?.trim() || null,
        submissionLink: data.submissionLink?.trim() || null,
      };

      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        payload,
      });

      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
      toast("Failed to update task. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTaskMutation.mutateAsync(task.id);
      onClose();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast("Failed to delete task. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                title="Delete task"
              >
                <Trash2 size={20} />
              </button>
              <h2 className="text-2xl font-semibold text-gray-800">
                {task.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800 mb-3">
                Are you sure you want to delete this task? This action cannot be
                undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleteTaskMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleteTaskMutation.isPending ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Start / Due Date */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("startDate")}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.startDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("endDate")}
                min={startDate}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.endDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Color Picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center justify-between pb-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    selectedColor === color
                      ? "scale-125 ring-2 ring-gray-400"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <textarea
              {...register("note")}
              placeholder="Describe this task"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Submission Link */}
          <div className="mb-7">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Submission link
            </label>
            <input
              type="url"
              {...register("submissionLink")}
              placeholder="https://www.url.com/"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.submissionLink ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.submissionLink && (
              <p className="mt-1 text-sm text-red-600">
                {errors.submissionLink.message}
              </p>
            )}
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={updateTaskMutation.isPending}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateTaskMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
