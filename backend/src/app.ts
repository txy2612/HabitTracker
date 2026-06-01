import cors from "cors";
import express from "express";
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

app.use("/api/habits", habitsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
