import { Router, type RequestHandler } from "express";
import { validate } from "../../middleware/validate.js";
import type {
  CreateHabitRequest,
  DeleteHabitRequest,
  UpdateHabitRemindersRequest,
  UpdateHabitRequest,
} from "./habits.schema.js";
// type = exist only for typescipt to check code
// REMOVED after compilation
// js do NOT have this (that checks the program)
import {
  createHabitRequestSchema,
  deleteHabitRequestSchema,
  updateHabitRemindersRequestSchema,
  updateHabitRequestSchema,
} from "./habits.schema.js";// real values
// import for runtime validation
import {
  createHabit as createHabitService,
  deleteHabit as deleteHabitService,
  listHabits,
  renameHabit,
  saveHabitReminders,
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
    const { body } = request.validated as CreateHabitRequest;// type is used here
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


//1. : RequestHandler = this function is an Express rute handler
    // so TS knows request, response, next are Express objects and can autocomplete them
//2. request = what user sends, response = what we send back, next = pass error to middleware
const updateHabitReminders: RequestHandler = async (request, response, next) => {
  try {
    // request.validated comes from middleware, mdw = door
    // controller = receptionist
    const { body } = request.validated as UpdateHabitRemindersRequest;
    const habits = await saveHabitReminders(body);

    response.json(habits);
  } catch (error) {
    next(error);
  }
};

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
router.patch("/reminders", validate(updateHabitRemindersRequestSchema), updateHabitReminders); 
// patch = update part of existing data (Change reminder time only)
router.put("/:id", validate(updateHabitRequestSchema), updateHabit);
router.delete("/:id", validate(deleteHabitRequestSchema), deleteHabit);

export default router;
