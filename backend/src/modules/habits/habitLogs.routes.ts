import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import type { HabitLogStatus } from "../../shared/types.js";
import { isDateString, isMonthString, todayString } from "../../shared/utils/dates.js";
import {
  deleteHabitLog as deleteHabitLogService,
  getHabitLogs as getHabitLogsService,
  saveHabitLog as saveHabitLogService,
} from "./habitLogs.service.js";

const habitIdParamsSchema = z.object({ id: z.string().min(1, "Habit id is required.") });
const dateStringSchema = z.string().refine(isDateString, { message: "Date must use YYYY-MM-DD format." });
const logDateSchema = z.string().refine(isDateString, { message: "Log date must use YYYY-MM-DD format." });
const monthStringSchema = z.string().refine(isMonthString, { message: "Month must use YYYY-MM format." });
const statusSchema = z.enum(["done", "missed", "skipped"]) satisfies z.ZodType<HabitLogStatus>;

const saveHabitLogRequestSchema = z.object({
  params: habitIdParamsSchema,
  body: z.object({
    logDate: z.preprocess((value) => value ?? todayString(), logDateSchema),
    status: z.preprocess((value) => value ?? "done", statusSchema),
    note: z.preprocess((value) => (typeof value === "string" ? value.trim() || null : null), z.string().nullable()),
  }),
});

const getHabitLogsRequestSchema = z.object({
  params: habitIdParamsSchema,
  query: z.object({ month: z.preprocess((value) => value ?? todayString().slice(0, 7), monthStringSchema) }),
});

const deleteHabitLogRequestSchema = z.object({
  params: habitIdParamsSchema,
  query: z.object({ date: dateStringSchema }),
});

type SaveHabitLogRequest = z.infer<typeof saveHabitLogRequestSchema>;
type GetHabitLogsRequest = z.infer<typeof getHabitLogsRequestSchema>;
type DeleteHabitLogRequest = z.infer<typeof deleteHabitLogRequestSchema>;

const saveHabitLog: RequestHandler = async (request, response, next) => {
  try {
    const { body, params } = request.validated as SaveHabitLogRequest;
    const log = await saveHabitLogService({
      userId: request.user!.id,
      habitId: params.id,
      logDate: body.logDate,
      status: body.status,
      note: body.note,
    });
    response.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

const getHabitLogs: RequestHandler = async (request, response, next) => {
  try {
    const { query, params } = request.validated as GetHabitLogsRequest;
    const logs = await getHabitLogsService({ userId: request.user!.id, habitId: params.id, month: query.month });
    response.json(logs);
  } catch (error) {
    next(error);
  }
};

const deleteHabitLog: RequestHandler = async (request, response, next) => {
  try {
    const { query, params } = request.validated as DeleteHabitLogRequest;
    await deleteHabitLogService({ userId: request.user!.id, habitId: params.id, date: query.date });
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const habitLogsRoutes = Router();
habitLogsRoutes.post("/:id/logs", validate(saveHabitLogRequestSchema), saveHabitLog);
habitLogsRoutes.get("/:id/logs", validate(getHabitLogsRequestSchema), getHabitLogs);
habitLogsRoutes.delete("/:id/logs", validate(deleteHabitLogRequestSchema), deleteHabitLog);
