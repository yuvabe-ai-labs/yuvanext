import { useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useReviewTask } from "@/hooks/useCandidateTasks";
import { Task, TaskStatus } from "@/types/candidateTasks.types";
import { toast } from "sonner";

const viewTaskSchema = z.object({
  remarks: z.string().optional(),
});

type ViewTaskFormData = z.infer<typeof viewTaskSchema>;

interface ViewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  applicationId: string;
}

export default function ViewTaskModal({
  isOpen,
  onClose,
  task,
  applicationId,
}: ViewTaskModalProps) {
  const reviewTaskMutation = useReviewTask();

  const form = useForm<ViewTaskFormData>({
    resolver: zodResolver(viewTaskSchema),
    defaultValues: {
      remarks: task.taskReviewRemarks || "",
    },
  });

  const remarks = form.watch("remarks");

  // Reset form when task changes
  useEffect(() => {
    form.reset({
      remarks: task.taskReviewRemarks || "",
    });
  }, [task, form]);

  // Send (Redo) - Update remarks and set status to redo
  const handleSend = async (data: ViewTaskFormData) => {
    if (!data.remarks?.trim()) {
      toast.error("Please add remarks before sending");
      return;
    }

    try {
      await reviewTaskMutation.mutateAsync({
        taskId: task.taskId,
        payload: {
          status: TaskStatus.REDO,
          reviewRemarks: data.remarks.trim(),
        },
      });

      toast.success("Task sent back for redo");
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("An error occurred while updating the task");
    }
  };

  // Close Task (Accept) - Set status to accepted
  const handleCloseTask = async (data: ViewTaskFormData) => {
    try {
      await reviewTaskMutation.mutateAsync({
        taskId: task.taskId,
        payload: {
          status: TaskStatus.ACCEPTED,
          reviewRemarks: data.remarks?.trim() || null,
        },
      });

      toast.success("Task accepted successfully");
      onClose();
    } catch (error) {
      console.error("Error accepting task:", error);
      toast.error("An error occurred while accepting the task");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <Form {...form}>
          <div className="space-y-5">
            {/* Date Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-700 font-medium">
                  Start date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    value={task.taskStartDate || "Not set"}
                    disabled
                    className="bg-gray-50 pl-10"
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700 font-medium">
                  Due date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    value={task.taskEndDate || "Not set"}
                    disabled
                    className="bg-gray-50 pl-10"
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Submission Link */}
            <div className="space-y-2">
              <label className="text-sm text-gray-700 font-medium">
                Submission link
              </label>
              {task.taskSubmissionLink ? (
                <a
                  href={task.taskSubmissionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md text-indigo-600 hover:text-indigo-800 hover:underline truncate"
                >
                  {task.taskSubmissionLink}
                </a>
              ) : (
                <Input
                  value="No Link available"
                  disabled
                  className="bg-gray-50"
                />
              )}
            </div>

            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700 font-medium">
                    Remarks
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add review remarks"
                      rows={4}
                      className="resize-none text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={form.handleSubmit(handleSend)}
                disabled={reviewTaskMutation.isPending || !remarks?.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6"
              >
                {reviewTaskMutation.isPending ? "Sending..." : "Send"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={form.handleSubmit(handleCloseTask)}
                disabled={reviewTaskMutation.isPending}
                className="rounded-full px-6"
              >
                {reviewTaskMutation.isPending ? "Processing..." : "Close Task"}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
