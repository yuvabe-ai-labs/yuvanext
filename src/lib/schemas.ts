import { Gender, MaritalStatus } from "@/types/profiles.types";
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
    },
  );

export const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
});

export type PhoneFormData = z.infer<typeof phoneSchema>;

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
    startTime: z.string().min(1, "Start time is required"),
    endDate: z.string().min(1, "Due date is required"),
    endTime: z.string().min(1, "End time is required"),
    color: z.string().min(1, "Please select a color"),
    note: z.string().min(1, "Note is required").trim(),
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
    },
  );

export const updateTaskSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endDate: z.string().min(1, "Due date is required"),
    endTime: z.string().min(1, "End time is required"),
    color: z.string().min(1, "Please select a color"),
    note: z.string().min(1, "Note is required").trim(),
    submissionLink: z
      .string()
      .trim()
      .min(1, "Submission link is required")
      .regex(
        /^https?:\/\/.+/,
        "Please enter a valid URL starting with http:// or https://",
      ),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    { message: "Due date cannot be before start date", path: ["endDate"] },
  );

export const courseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  provider: z.string().min(1, "Provider is required"),
  completion_date: z.string().min(1, "Completion date is required"),
  certificate_url: z.string().url().optional().or(z.literal("")),
});

export const educationSchema = z
  .object({
    degree: z.string().min(1, "Degree is required"),
    institution: z.string().min(1, "Institution is required"),
    start_year: z.string().regex(/^\d{4}$/, "Must be a 4-digit year"),
    end_year: z
      .string()
      .regex(/^\d{4}$/, "Must be a 4-digit year")
      .optional()
      .or(z.literal("")),
    score: z.string().optional(),
    is_current: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.is_current) return true;
      if (!data.end_year) return false;
      return parseInt(data.end_year) >= parseInt(data.start_year);
    },
    {
      message: "End year must be after start year",
      path: ["end_year"],
    },
  );

export const internshipSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    company: z.string().min(1, "Company is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    is_current: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (!data.is_current && !data.end_date) return false;
      return true;
    },
    {
      message: "End date is required for completed internships",
      path: ["end_date"],
    },
  )
  .refine(
    (data) => {
      if (data.is_current || !data.end_date || !data.start_date) return true;
      return new Date(data.end_date) >= new Date(data.start_date);
    },
    {
      message: "End date must be after the start date",
      path: ["end_date"],
    },
  );

export const personalDetailsSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  location: z.string().min(1, "Location is required"),
  gender: z.nativeEnum(Gender).optional(),
  marital_status: z
    .nativeEnum(MaritalStatus, {
      errorMap: (issue, _ctx) => {
        switch (issue.code) {
          case "invalid_enum_value":
          case "invalid_type":
            return { message: "Please select a marital status" };
          default:
            return { message: "Invalid selection" };
        }
      },
    })
    .optional(),
  birth_date: z.string().optional(),
  birth_month: z.string().optional(),
  birth_year: z.string().optional(),
  is_differently_abled: z.boolean().optional(),
  has_career_break: z.boolean().optional(),
  language: z
    .array(
      z.object({
        name: z.string().min(1, "Please select a language"),
        read: z.boolean(),
        write: z.boolean(),
        speak: z.boolean(),
      }),
    )
    .default([]),
});

export const summarySchema = z.object({
  profileSummary: z
    .string()
    .min(10, "Profile summary should be at least 10 characters long")
    .max(1000, "Profile summary should not exceed 1000 characters"),
});

export const projectSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    technologies: z
      .array(z.object({ value: z.string().min(1) }))
      .min(1, "At least one technology is required"),
    start_date: z.string().min(1, "Start date is required"), // Start date is now a dependency
    completionDate: z.string().optional().or(z.literal("")),
    projectUrl: z.string().url().optional().or(z.literal("")),
    is_current: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (
        !data.is_current &&
        (!data.completionDate || data.completionDate === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "End date is required if project is completed",
      path: ["completionDate"],
    },
  )
  .refine(
    (data) => {
      if (data.is_current || !data.completionDate || !data.start_date)
        return true;
      return new Date(data.completionDate) >= new Date(data.start_date);
    },
    {
      message: "End date cannot be before start date",
      path: ["completionDate"],
    },
  );

export const acceptInvitationSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase character")
    .regex(/[A-Z]/, "Password must contain at least one uppercase character")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character",
    ),
});

export const interestsSchema = z.object({
  interests: z.array(z.object({ value: z.string() })),
});

export const skillsFormSchema = z.object({
  skills: z.array(z.object({ value: z.string() })),
});
