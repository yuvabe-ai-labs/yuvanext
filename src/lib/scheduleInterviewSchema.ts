import z from "zod";

export const scheduleInterviewSchema = z.object({
  title: z.string().min(1, "Interview Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

export type ScheduleFormValues = z.infer<typeof scheduleInterviewSchema>;
