// validation
import { z } from "zod";

const habitNameSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : ""),
  z.string().min(1, "Habit name is required."),
);

export const habitBodySchema = z.object({
  name: habitNameSchema,
});

export const createHabitRequestSchema = z.object({
  body: habitBodySchema,
});

export const updateHabitRequestSchema = createHabitRequestSchema.extend({
  params: z.object({
    id: z.string().min(1, "Habit id is required."),
  }),
});

export const deleteHabitRequestSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Habit id is required."),
  }),
});

export type HabitBody = z.infer<typeof habitBodySchema>;
export type CreateHabitRequest = z.infer<typeof createHabitRequestSchema>;
export type UpdateHabitRequest = z.infer<typeof updateHabitRequestSchema>;
export type DeleteHabitRequest = z.infer<typeof deleteHabitRequestSchema>;
