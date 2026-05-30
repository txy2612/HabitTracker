import { Router } from "express";
import { pool } from "../db/pool.js";
import { calculateStreak } from "../services/streaks.js";
import type { HabitLog, HabitLogStatus } from "../types.js";
import { isDateString, isMonthString, monthRange, todayString } from "../utils/dates.js";

const router = Router();
const validStatuses = new Set<HabitLogStatus>(["done", "missed", "skipped"]);

function cleanName(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

router.post("/", async (request, response, next) => {
  try {
    const name = cleanName(request.body.name);

    if (!name) {
      response.status(400).json({ message: "Habit name is required." });
      return;
    }

    const result = await pool.query(
      `INSERT INTO habits (name)
       VALUES ($1)
       RETURNING *`,
      [name],
    );

    response.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (_request, response, next) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM habits
       ORDER BY created_at DESC`,
    );

    response.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (request, response, next) => {
  try {
    const name = cleanName(request.body.name);

    if (!name) {
      response.status(400).json({ message: "Habit name is required." });
      return;
    }

    const result = await pool.query(
      `UPDATE habits
       SET name = $1
       WHERE id = $2
       RETURNING *`,
      [name, request.params.id],
    );

    if (result.rowCount === 0) {
      response.status(404).json({ message: "Habit not found." });
      return;
    }

    response.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/logs", async (request, response, next) => {
  try {
    const logDate = request.body.logDate ?? todayString();
    const status = request.body.status ?? "done";
    const note = typeof request.body.note === "string" ? request.body.note.trim() : null;

    if (!isDateString(logDate)) {
      response.status(400).json({ message: "Log date must use YYYY-MM-DD format." });
      return;
    }

    if (!validStatuses.has(status)) {
      response.status(400).json({ message: "Status must be done, missed, or skipped." });
      return;
    }

    const result = await pool.query(
      `INSERT INTO habit_logs (habit_id, log_date, status, note)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (habit_id, log_date)
       DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note
       RETURNING *`,
      [request.params.id, logDate, status, note || null],
    );

    response.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/logs", async (request, response, next) => {
  try {
    const month = request.query.month ?? todayString().slice(0, 7);

    if (!isMonthString(month)) {
      response.status(400).json({ message: "Month must use YYYY-MM format." });
      return;
    }

    const range = monthRange(month);
    const result = await pool.query<HabitLog>(
      `SELECT *
       FROM habit_logs
       WHERE habit_id = $1
         AND log_date >= $2
         AND log_date < $3
       ORDER BY log_date ASC`,
      [request.params.id, range.start, range.end],
    );

    response.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id/logs", async (request, response, next) => {
  try {
    const date = request.query.date;

    if (!isDateString(date)) {
      response.status(400).json({ message: "Date must use YYYY-MM-DD format." });
      return;
    }

    await pool.query(
      `DELETE FROM habit_logs
       WHERE habit_id = $1 AND log_date = $2`,
      [request.params.id, date],
    );

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/:id/streak", async (request, response, next) => {
  try {
    const result = await pool.query<HabitLog>(
      `SELECT *
       FROM habit_logs
       WHERE habit_id = $1
       ORDER BY log_date ASC`,
      [request.params.id],
    );

    response.json(calculateStreak(result.rows));
  } catch (error) {
    next(error);
  }
});

export default router;
