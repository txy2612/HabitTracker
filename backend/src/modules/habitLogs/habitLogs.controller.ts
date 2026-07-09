import { Router, type RequestHandler } from "express";
import { validate } from "../../middleware/validate.js";
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

const saveHabitLog: RequestHandler = async (request, response, next) => {
  try {
    const { body, params } = request.validated as SaveHabitLogRequest;
    const userId = request.user!.id;

    const log = await saveHabitLogService({
      userId,
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
    const userId = request.user!.id;

    const logs = await getHabitLogsService({
      userId,
      habitId: params.id,
      month: query.month,
    });

    response.json(logs);
  } catch (error) {
    next(error);
  }
};

const deleteHabitLog: RequestHandler = async (request, response, next) => {
  try {
    const { query, params } = request.validated as DeleteHabitLogRequest;
    const userId = request.user!.id;

    await deleteHabitLogService({
      userId,
      habitId: params.id,
      date: query.date,
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
