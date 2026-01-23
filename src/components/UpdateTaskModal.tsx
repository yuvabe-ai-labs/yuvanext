import { X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateTask, useDeleteTask } from "@/hooks/useCandidateTasks";
import { Task, TaskStatus } from "@/types/candidateTasks.types";
import type { UpdateTaskPayload } from "@/types/candidateTasks.types";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateTaskSchema } from "@/lib/schemas";

interface UpdateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  applicationId: string;
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

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const form = useForm<UpdateTaskFormData>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      startDate: task.taskStartDate || "",
      startTime: task.taskStartTime || "",
      endDate: task.taskEndDate || "",
      endTime: task.taskEndTime || "",
      color: task.taskColor || COLORS[0],
      note: task.taskDescription || "",
      submissionLink: task.taskSubmissionLink || "",
    },
  });

  const selectedColor = form.watch("color");
  const startDate = form.watch("startDate");

  useEffect(() => {
    if (task && isOpen) {
      form.reset({
        startDate: task.taskStartDate || "",
        startTime: task.taskStartTime || "",
        endDate: task.taskEndDate || "",
        endTime: task.taskEndTime || "",
        color: task.taskColor || COLORS[0],
        note: task.taskDescription || "",
        submissionLink: task.taskSubmissionLink || "",
      });
    }
  }, [task, isOpen, form]);

  const onSubmit = async (data: UpdateTaskFormData) => {
    try {
      const newStatus = data.submissionLink?.trim()
        ? TaskStatus.SUBMITTED
        : task.taskStatus;

      const payload: UpdateTaskPayload = {
        title: task.taskTitle,
        startDate: data.startDate,
        startTime: data.startTime,
        endDate: data.endDate,
        endTime: data.endTime,
        color: data.color,
        description: data.note,
        submissionLink: data.submissionLink?.trim() || null,
        status: newStatus,
      };

      await updateTaskMutation.mutateAsync({
        taskId: task.taskId,
        payload,
      });

      toast.success(
        newStatus === TaskStatus.SUBMITTED
          ? "Task submitted successfully!"
          : "Task updated successfully",
      );
      onClose();
    } catch (error) {
      toast.error("Failed to update task. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTaskMutation.mutateAsync(task.taskId);
      toast.success("Task deleted successfully");
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      toast.error("Failed to delete task. Please try again.");
    }
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    form.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
                aria-label="Delete task"
              >
                <Trash2 size={20} />
              </button>
              <h2 className="text-2xl font-semibold text-gray-800 truncate">
                {task.taskTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800 mb-3 font-medium">
                Are you sure you want to delete this task permanently?
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteTaskMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 rounded-lg"
                  size="sm"
                >
                  {deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="rounded-lg"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Start Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Start Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Time <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="time" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Due Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Due Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={startDate}
                          className="rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Time <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="time" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Color Picker */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Theme Color <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-3 flex-wrap">
                        {COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => field.onChange(color)}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Note */}
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Notes <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Task details..."
                        rows={3}
                        className="rounded-xl resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submission Link */}
              <FormField
                control={form.control}
                name="submissionLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission Link (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/submission"
                        className="rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={updateTaskMutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-full py-6 text-base font-semibold"
              >
                {updateTaskMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
