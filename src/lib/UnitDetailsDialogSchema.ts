import { z } from "zod";

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
