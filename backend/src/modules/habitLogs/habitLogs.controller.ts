import { Router, type RequestHandler } from "express";
import { validate } from "../../middleware/validate.js";
import type { HabitLogStatus } from "../../types.js";
import { isDateString, isMonthString, todayString } from "../../utils/dates.js";
import type { DeleteHabitLogRequest, GetHabitLogsRequest, SaveHabitLogRequest } from "./habitLogs.schema.js";
import {
  deleteHabitLogRequestSchema,
  getHabitLogsRequestSchema,
  saveHabitLogRequestSchema,
} from "./habitLogs.schema.js";
import {
  deleteHabitLog as deleteHabitLogService,
  getHabitLogs as getHabitLogsService,
  saveHabitLog as saveHabitLogService,
} from "./habitLogs.service.js";

const router = Router();
const validStatuses = new Set<string>(["done", "missed", "skipped"]);

const saveHabitLog: RequestHandler = async (request, response, next) => {
  try {
    const { body, params } = request.validated as SaveHabitLogRequest;
    const logDate = body.logDate ?? todayString();
    const status = body.status ?? "done";
    const note = typeof body.note === "string" ? body.note.trim() : null;

    if (!isDateString(logDate)) {
      response.status(400).json({ message: "Log date must use YYYY-MM-DD format." });
      return;
    }

    if (typeof status !== "string" || !validStatuses.has(status)) {
      response.status(400).json({ message: "Status must be done, missed, or skipped." });
      return;
    }

    const log = await saveHabitLogService({
      habitId: params.id,
      logDate,
      status: status as HabitLogStatus,
      note: note || null,
    });

    response.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

const getHabitLogs: RequestHandler = async (request, response, next) => {
  try {
    const { query, params } = request.validated as GetHabitLogsRequest;
    const month = query.month ?? todayString().slice(0, 7);

    if (!isMonthString(month)) {
      response.status(400).json({ message: "Month must use YYYY-MM format." });
      return;
    }

    const logs = await getHabitLogsService({
      habitId: params.id,
      month,
    });

    response.json(logs);
  } catch (error) {
    next(error);
  }
};

const deleteHabitLog: RequestHandler = async (request, response, next) => {
  try {
    const { query, params } = request.validated as DeleteHabitLogRequest;
    const date = query.date;

    if (!isDateString(date)) {
      response.status(400).json({ message: "Date must use YYYY-MM-DD format." });
      return;
    }

    await deleteHabitLogService({
      habitId: params.id,
      date,
    });

    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

router.post("/:id/logs", validate(saveHabitLogRequestSchema), saveHabitLog);
router.get("/:id/logs", validate(getHabitLogsRequestSchema), getHabitLogs);
router.delete("/:id/logs", validate(deleteHabitLogRequestSchema), deleteHabitLog);

export default router;
