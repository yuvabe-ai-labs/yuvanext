import { z } from "zod";
import type { TaskStatus } from "@/types/studentTasks.types";

// Add Task Schema
export const addTaskSchema = z
  .object({
    title: z.string().min(1, "Task name is required").trim(),
    startDate: z.string().min(1, "Start date is required"),
    startTime: z.string().optional(),
    endDate: z.string().min(1, "Due date is required"),
    endTime: z.string().optional(),
    color: z.string().min(1, "Color is required"),
    note: z.string().optional(),
    submissionLink: z
      .string()
      .url("Invalid URL format")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "Due date cannot be before start date",
      path: ["endDate"],
    }
  );

export type AddTaskFormData = z.infer<typeof addTaskSchema>;

// Update Task Schema
export const updateTaskSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "Due date is required"),
    color: z.string().min(1, "Color is required"),
    note: z.string().optional(),
    submissionLink: z
      .string()
      .url("Invalid URL format")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "Due date cannot be before start date",
      path: ["endDate"],
    }
  );

export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;

// View Task Schema (for remarks)
export const viewTaskSchema = z.object({
  remarks: z.string().optional(),
});

export type ViewTaskFormData = z.infer<typeof viewTaskSchema>;

// Constants
export const TASK_COLORS = [
  "#F97316", // Orange
  "#10B981", // Green (Emerald)
  "#0EA5E9", // Cyan/Teal
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F59E0B", // Amber/Yellow
] as const;
