import { Router } from "express";
import habitLogsRouter from "./modules/habitLogs/habitLogs.controller.js";
import habitsRouter from "./modules/habits/habits.controller.js";
import streaksRouter from "./modules/streaks/streaks.controller.js";

const router = Router();


router.use("/", habitsRouter);
router.use("/", habitLogsRouter);
router.use("/", streaksRouter);

export default router;
