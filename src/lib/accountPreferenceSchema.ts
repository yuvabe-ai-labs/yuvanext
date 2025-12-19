import { z } from "zod";

export const preferencesSchema = z.object({
  language: z.string().min(1, "Required"),
  contentLanguage: z.string().min(1, "Required"),
});

export type PreferencesFormValues = z.infer<typeof preferencesSchema>;
