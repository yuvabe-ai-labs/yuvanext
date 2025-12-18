import { z } from "zod";

export const updateEmailSchema = z.object({
  newEmail: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
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
  internship_updates_in_app: z.boolean(),
  internship_updates_email: z.boolean(),
  recommended_internship_in_app: z.boolean(),
  recommended_internship_email: z.boolean(),
  similar_internships_in_app: z.boolean(),
  similar_internships_email: z.boolean(),
  recommended_courses_in_app: z.boolean(),
  recommended_courses_email: z.boolean(),
});
