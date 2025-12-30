import { z } from "zod";

export const updateEmailSchema = z
  .object({
    currentEmail: z
      .string()
      .min(1, "Current email is required")
      .email("Invalid current email"),

    newEmail: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),

    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
  })
  .refine(
    (data) => data.currentEmail.toLowerCase() !== data.newEmail.toLowerCase(),
    {
      message: "New email must be different from current email",
      path: ["newEmail"],
    }
  );

export const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

export const notificationSchema = z.object({
  allow_all: z.boolean(),
  application_status_in_app: z.boolean(),
  application_status_email: z.boolean(),
});

export const taskSchema = z
  .object({
    title: z.string().min(1, "Task name is required").trim(),
    startDate: z.string().min(1, "Start date is required"),
    startTime: z.string().optional(),
    endDate: z.string().min(1, "Due date is required"),
    endTime: z.string().optional(),
    color: z.string(),
    note: z.string().optional(),
    submissionLink: z
      .string()
      .url("Please enter a valid URL")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      // Validate that end date is not before start date
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

export const updateTaskSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "Due date is required"),
    color: z.string(),
    note: z.string().optional(),
    submissionLink: z
      .string()
      .transform((val) => val.trim())
      .refine(
        (val) => val === "" || /^https?:\/\/.+/.test(val),
        "Please enter a valid URL"
      )
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      // Validate that end date is not before start date
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
