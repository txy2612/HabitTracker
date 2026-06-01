import { Router, type RequestHandler } from "express";
import { validate } from "../../middleware/validate.js";
import type { CreateHabitRequest, DeleteHabitRequest, UpdateHabitRequest } from "./habits.schema.js";// type = exist only for typescipt to check code. after compilation ts remove them 
import { createHabitRequestSchema, deleteHabitRequestSchema, updateHabitRequestSchema } from "./habits.schema.js";// real values
import {
  createHabit as createHabitService,
  deleteHabit as deleteHabitService,
  listHabits,
  renameHabit,
} from "./habits.service.js";

const router = Router();

// type = blueprint (gives shape of building)
// real values = building

/* requestHandler = Express TypeScript type 
   with it, typescipt knows: request , response , next = express next function
  -> auto complete
*/

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

    response.json(habit);
  } catch (error) {
    next(error);
  }
};

// requestHandler = Express Typescript type that helps autocomplete when typing
// know request = Express request, response = Express response, next = Express NextFunction
const deleteHabit: RequestHandler = async (request, response, next) => {
  try {
    const { params } = request.validated as DeleteHabitRequest;

    await deleteHabitService(params.id);

    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

router.post("/", validate(createHabitRequestSchema), createHabit);
router.get("/", getHabits);
router.put("/:id", validate(updateHabitRequestSchema), updateHabit);
router.delete("/:id", validate(deleteHabitRequestSchema), deleteHabit);

export default router;
