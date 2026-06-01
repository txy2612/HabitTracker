import { Router, type RequestHandler } from "express";
import { validate } from "../../middleware/validate.js";
import type { GetStreakRequest } from "./streaks.schema.js";
import { getStreakRequestSchema } from "./streaks.schema.js";
import { getStreak as getStreakService } from "./streaks.service.js";

const router = Router();

const getStreak: RequestHandler = async (request, response, next) => {
  try {
    const { params } = request.validated as GetStreakRequest;
    const streak = await getStreakService(params.id);

    response.json(streak);
  } catch (error) {
    next(error);
  }
};

router.get("/:id/streak", validate(getStreakRequestSchema), getStreak);

export default router;
