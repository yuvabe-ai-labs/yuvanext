import { useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateStudentTask } from "@/hooks/useStudentTasks";
import type { StudentTask } from "@/types/studentTasks.types";
import { viewTaskSchema, type ViewTaskFormData } from "@/lib/taskSchemas";
import { toast } from "sonner";

interface ViewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: StudentTask;
}

export default function ViewTaskModal({
  isOpen,
  onClose,
  task,
}: ViewTaskModalProps) {
  const updateTaskMutation = useUpdateStudentTask();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<ViewTaskFormData>({
    resolver: zodResolver(viewTaskSchema),
    defaultValues: {
      remarks: task.review_remarks || "",
    },
  });

  const remarks = watch("remarks");

  // Reset form when task changes
  useEffect(() => {
    reset({
      remarks: task.review_remarks || "",
    });
  }, [task, reset]);

  // Send (Redo) - Update remarks and set status to redo
  const handleSend = async (data: ViewTaskFormData) => {
    if (!data.remarks?.trim()) {
      toast.error("Please add remarks before sending");
      return;
    }

    try {
      const result = await updateTaskMutation.mutateAsync({
        taskId: task.id,
        updates: {
          status: "redo",
          review_remarks: data.remarks.trim(),
        },
      });

      if (result.success) {
        toast.success("Task sent back for redo");
        onClose();
      } else {
        toast.error("Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("An error occurred while updating the task");
    }
  };

  // Close Task (Accept) - Set status to accepted
  const handleCloseTask = async (data: ViewTaskFormData) => {
    try {
      const updateData: any = {
        status: "accepted",
      };

      // If there are remarks, save them too
      if (data.remarks?.trim() && data.remarks !== task.review_remarks) {
        updateData.review_remarks = data.remarks.trim();
      }

      const result = await updateTaskMutation.mutateAsync({
        taskId: task.id,
        updates: updateData,
      });

      if (result.success) {
        toast.success("Task accepted successfully");
        onClose();
      } else {
        toast.error("Failed to accept task");
      }
    } catch (error) {
      console.error("Error accepting task:", error);
      toast.error("An error occurred while accepting the task");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {task.title}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-700 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm text-gray-600 font-medium">
                Start date <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {task.start_date
                    ? format(new Date(task.start_date), "dd/MM/yyyy")
                    : "Not set"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-gray-600 font-medium">
                Due date <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {task.end_date
                    ? format(new Date(task.end_date), "dd/MM/yyyy")
                    : "Not set"}
                </span>
              </div>
            </div>
          </div>

          {/* Submission Link */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-600 font-medium">
              Submission link
            </label>

            {task.submission_link ? (
              <a
                href={
                  task.submission_link.startsWith("http")
                    ? task.submission_link
                    : `https://${task.submission_link}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 text-sm text-blue-600 underline hover:text-blue-700 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors break-all"
              >
                {task.submission_link}
              </a>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg bg-gray-50">
                No Link available
              </div>
            )}
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-600 font-medium">Remarks</label>
            <Textarea
              {...register("remarks")}
              placeholder="Describe the task"
              rows={4}
              className="resize-none text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={handleSubmit(handleSend)}
              disabled={isSubmitting || !remarks?.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6"
            >
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit(handleCloseTask)}
              disabled={isSubmitting}
              className="rounded-full px-6"
            >
              {isSubmitting ? "Processing..." : "Close Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
