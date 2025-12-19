import * as z from "zod";

export const demographicSchema = z.object({
  gender: z.string().min(1, "Please select a gender"),
  disability: z.enum(["Yes", "No"]),
});

export type DemographicFormValues = z.infer<typeof demographicSchema>;
