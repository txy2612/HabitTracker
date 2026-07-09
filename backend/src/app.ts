import cors from "cors";
import express from "express";
import { checkDatabaseHealth } from "./db/health.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import habitsRouter from "./routes.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { requestId } from "./middleware/requestId.js";

export const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
  }),
);
app.use(express.json());
app.use(requestId);

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/health/db", async (_request, response) => {
  const health = await checkDatabaseHealth();

  response.status(health.ok ? 200 : 503).json(health);
});

app.use("/api/auth", authRoutes);
app.use("/api/habits", habitsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
