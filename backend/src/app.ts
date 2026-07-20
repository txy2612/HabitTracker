import cors from "cors";
import express from "express";
import { requestLogger } from "./middleware/requestLogger.js";
import { checkDatabaseHealth } from "./db/health.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { habitsRoutes } from "./modules/habits/habits.routes.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { requestId } from "./middleware/requestId.js";
export const app = express();

app.use(requestId);
app.use(requestLogger);
app.use(
  cors({
    origin: env.corsOrigin,
  }),
);
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/health/db", requireAuth, async (_request, response) => {
  const health = await checkDatabaseHealth();

  response.status(health.ok ? 200 : 503).json(health);
});

app.use("/api/auth", authRoutes);
app.use("/api/habits", requireAuth, habitsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
