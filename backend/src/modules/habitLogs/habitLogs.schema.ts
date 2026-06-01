import { z } from "zod";

const habitIdParamsSchema = z.object({
  id: z.string().min(1, "Habit id is required."),
});

export const saveHabitLogRequestSchema = z.object({
  params: habitIdParamsSchema,
  body: z
    .object({
      logDate: z.unknown().optional(),
      status: z.unknown().optional(),
      note: z.unknown().optional(),
    })
    .passthrough(),
});

export const getHabitLogsRequestSchema = z.object({
  params: habitIdParamsSchema,
  query: z
    .object({
      month: z.unknown().optional(),
    })
    .passthrough(),
});

export const deleteHabitLogRequestSchema = z.object({
  params: habitIdParamsSchema,
  query: z
    .object({
      date: z.unknown().optional(),
    })
    .passthrough(),
});

export type SaveHabitLogRequest = z.infer<typeof saveHabitLogRequestSchema>;
export type GetHabitLogsRequest = z.infer<typeof getHabitLogsRequestSchema>;
export type DeleteHabitLogRequest = z.infer<typeof deleteHabitLogRequestSchema>;
