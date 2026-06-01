import { Router, type RequestHandler } from "express";
import { validate } from "../../middleware/validate.js";
import type { CreateHabitRequest, UpdateHabitRequest } from "./habits.schema.js";
import { createHabitRequestSchema, updateHabitRequestSchema } from "./habits.schema.js";
import { createHabit as createHabitService, listHabits, renameHabit } from "./habits.service.js";

const router = Router();

const createHabit: RequestHandler = async (request, response, next) => {
  try {
    const { body } = request.validated as CreateHabitRequest;
    const habit = await createHabitService(body);

    response.status(201).json(habit);
  } catch (error) {
    next(error);
  }
};

const getHabits: RequestHandler = async (_request, response, next) => {
  try {
    const habits = await listHabits();

    response.json(habits);
  } catch (error) {
    next(error);
  }
};

const updateHabit: RequestHandler = async (request, response, next) => {
  try {
    const { body, params } = request.validated as UpdateHabitRequest;
    const habit = await renameHabit(params.id, body);

    if (!habit) {
      response.status(404).json({ message: "Habit not found." });
      return;
    }

    response.json(habit);
  } catch (error) {
    next(error);
  }
};

router.post("/", validate(createHabitRequestSchema), createHabit);
router.get("/", getHabits);
router.put("/:id", validate(updateHabitRequestSchema), updateHabit);

export default router;
