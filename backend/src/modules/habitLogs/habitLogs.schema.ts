import { z } from "zod";
import type { HabitLogStatus } from "../../shared/types.js";
import { isDateString, isMonthString, todayString } from "../../shared/utils/dates.js";

const habitIdParamsSchema = z.object({
  id: z.string().min(1, "Habit id is required."),
});

const dateStringSchema = z.string().refine(isDateString, {
  message: "Date must use YYYY-MM-DD format.",
});

const logDateSchema = z.string().refine(isDateString, {
  message: "Log date must use YYYY-MM-DD format.",
});

const monthStringSchema = z.string().refine(isMonthString, {
  message: "Month must use YYYY-MM format.",
});

const statusSchema = z.enum(["done", "missed", "skipped"]) satisfies z.ZodType<HabitLogStatus>;

export const saveHabitLogRequestSchema = z.object({
  params: habitIdParamsSchema,
  body: z.object({
    logDate: z.preprocess((value) => value ?? todayString(), logDateSchema),
    status: z.preprocess((value) => value ?? "done", statusSchema),
    note: z.preprocess((value) => (typeof value === "string" ? value.trim() || null : null), z.string().nullable()),
  }),
});

export const getHabitLogsRequestSchema = z.object({
  params: habitIdParamsSchema,
  query: z.object({
    month: z.preprocess((value) => value ?? todayString().slice(0, 7), monthStringSchema),
  }),
});

export const deleteHabitLogRequestSchema = z.object({
  params: habitIdParamsSchema,
  query: z.object({
    date: dateStringSchema,
  }),
});

export type SaveHabitLogRequest = z.infer<typeof saveHabitLogRequestSchema>;
export type GetHabitLogsRequest = z.infer<typeof getHabitLogsRequestSchema>;
export type DeleteHabitLogRequest = z.infer<typeof deleteHabitLogRequestSchema>;
