import { z } from "zod";

export const getStreakRequestSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Habit id is required."),
  }),
});

export type GetStreakRequest = z.infer<typeof getStreakRequestSchema>;
