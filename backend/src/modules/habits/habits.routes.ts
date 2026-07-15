import { Router } from "express";
import habitsController from "./habits.controller.js";
import { habitLogsRoutes } from "./habitLogs.routes.js";
import { streaksRoutes } from "./streaks.routes.js";

export const habitsRoutes = Router();
habitsRoutes.use("/", habitsController);
habitsRoutes.use("/", habitLogsRoutes);
habitsRoutes.use("/", streaksRoutes);
