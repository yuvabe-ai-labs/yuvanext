import { z } from "zod";

export const languageSchema = z
  .object({
    language: z.string().min(1, "Language is required"),
    read: z.boolean(),
    write: z.boolean(),
    speak: z.boolean(),
  })
  .refine((data) => data.read || data.write || data.speak, {
    message: "Select at least one proficiency (Read, Write, or Speak)",
    path: ["read"],
  });

export const createInternshipSchema = z.object({
  title: z.string().min(1, "Job/Intern Role is required"),
  duration: z.string().min(1, "Internship Period is required"),
  isPaid: z.boolean(),
  payment: z.string().optional(),
  description: z
    .string()
    .min(10, "About Internship must be at least 10 characters"),
  responsibilities: z.string().min(10, "Key Responsibilities is required"),
  benefits: z.string().min(10, "Post Internship benefits is required"),
  skills_required: z.string().min(1, "Skills Required is required"),
  language_requirements: z
    .array(languageSchema)
    .min(1, "At least one language is required"),
  min_age_required: z.coerce.number().min(1, "Age is required"),
  job_type: z.enum(["full_time", "part_time", "both"]),
  application_deadline: z.date({
    required_error: "Application deadline is required",
  }),
});

// Infer the type from the schema
export type InternshipFormValues = z.infer<typeof createInternshipSchema>;

// Helper interface for UI mapping
export interface LanguageProficiency {
  language: string;
  read: boolean;
  write: boolean;
  speak: boolean;
}
