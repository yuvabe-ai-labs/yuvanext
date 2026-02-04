import z from "zod";

export const achievementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().optional(), // Returns YYYY-MM-DD string from input type="date"
});

// Infer Type
export type AchievementFormValues = z.infer<typeof achievementSchema>;

export const unitDetailsSchema = z.object({
  name: z.string().min(1, "Unit name is required"),
  type: z.string().optional(),
  industry: z.string().optional(),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")), // Allows valid URL or empty string
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  isAurovillian: z.boolean().default(false),
});

// Derive TypeScript type from the schema
export type UnitDetailsFormValues = z.infer<typeof unitDetailsSchema>;

// 1. Define Zod Schema
export const descriptionSchema = z.object({
  description: z.string().optional(), // Allow empty string if user clears it
});

export type DescriptionFormValues = z.infer<typeof descriptionSchema>;

// --- 1. Zod Schema Definition ---
export const unitAndDescriptionSchema = z.object({
  // Profile Fields
  full_name: z.string().min(1, "Full Name is required"),

  // Unit Fields
  unit_name: z.string().min(1, "Unit Name is required"),
  unit_type: z.string().optional(),
  industry: z.string().optional(),
  website_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  is_aurovillian: z.boolean().default(false),

  // Description Field
  description: z.string().optional(),
});

// Infer Types
export type UnitAndDescriptionFormValues = z.infer<
  typeof unitAndDescriptionSchema
>;

export const projectSchema = z
  .object({
    projectName: z.string().min(1, "Project Name is required"),
    clientName: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["Ongoing", "Completed"]).default("Ongoing"),
    completionDate: z.string().optional(),
  })
  .refine(
    (data) => {
      // Custom validation: completionDate is required ONLY if status is Completed
      if (data.status === "Completed" && !data.completionDate) {
        return false;
      }
      return true;
    },
    {
      message: "Completion date is required for completed projects",
      path: ["completionDate"], // Error will appear on this field
    }
  );

// Infer Type
export type ProjectFormValues = z.infer<typeof projectSchema>;

// 1. Define Zod Schema
export const socialLinkSchema = z.object({
  links: z.array(
    z.object({
      id: z.string().optional(), // ID is optional in the form (generated later for new items)
      platform: z.string().min(1, "Platform is required"),
      url: z.string().url("Must be a valid URL"),
    })
  ),
});

export type SocialLinksFormValues = z.infer<typeof socialLinkSchema>;
