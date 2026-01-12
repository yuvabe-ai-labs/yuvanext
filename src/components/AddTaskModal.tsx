import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTask } from "@/hooks/useCandidateTasks";
import { taskSchema } from "@/lib/schemas";
import type { CreateTaskPayload } from "@/types/candidateTasks.types";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  studentId: string;
}

const COLORS = [
  "#F97316", // Orange
  "#10B981", // Green (Emerald)
  "#0EA5E9", // Cyan/Teal
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F59E0B", // Amber/Yellow
];

type TaskFormData = z.infer<typeof taskSchema>;

export default function AddTaskModal({
  isOpen,
  onClose,
  applicationId,
  studentId,
}: AddTaskModalProps) {
  const createTask = useCreateTask();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      color: COLORS[0],
      note: "",
      submissionLink: "",
    },
  });

  const selectedColor = watch("color");
  const startDate = watch("startDate");

  const onSubmit = async (data: TaskFormData) => {
    try {
      const payload: CreateTaskPayload = {
        applicationId,
        title: data.title,
        description: data.note?.trim() || null,
        startDate: data.startDate || null,
        startTime: data.startTime || null,
        endDate: data.endDate || null,
        endTime: data.endTime || null,
        color: data.color || null,
      };

      await createTask.mutateAsync(payload);

      reset();
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Add New Task
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Task Name */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              placeholder="Enter task name"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Start Date and Time */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("startDate")}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
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
                Time
              </label>
              <input
                type="time"
                {...register("startTime")}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("endDate")}
                min={startDate}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.endDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.endDate.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                {...register("endTime")}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    selectedColor === color
                      ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <textarea
              {...register("note")}
              placeholder="Please describe the task"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Submission Link - Commented out as per original */}
          {/* <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Submission link
            </label>
            <input
              type="url"
              {...register("submissionLink")}
              placeholder="https://www.url.com/"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                errors.submissionLink ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.submissionLink && (
              <p className="mt-1 text-sm text-red-600">
                {errors.submissionLink.message}
              </p>
            )}
          </div> */}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={createTask.isPending}
              className="flex-1 py-3 bg-teal-600 text-white font-medium rounded-full hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTask.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
