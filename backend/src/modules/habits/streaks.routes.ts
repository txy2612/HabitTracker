import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { getStreak as getStreakService } from "./streaks.service.js";

const getStreakRequestSchema = z.object({
  params: z.object({ id: z.string().min(1, "Habit id is required.") }),
});
type GetStreakRequest = z.infer<typeof getStreakRequestSchema>;

const getStreak: RequestHandler = async (request, response, next) => {
  try {
    const { params } = request.validated as GetStreakRequest;
    response.json(await getStreakService(request.user!.id, params.id));
  } catch (error) {
    next(error);
  }
};

export const streaksRoutes = Router();
streaksRoutes.get("/:id/streak", validate(getStreakRequestSchema), getStreak);
