// receives requests from apiClient.ts
import { Router } from "express";
import { pool } from "../db/pool.js"; // pool = several clinic computers connected to same patient database
import habitsRouter from "../modules/habits/habits.controller.js";
import { calculateStreak } from "../services/streaks.js";
import type { HabitLog, HabitLogStatus } from "../types.js";
import { isDateString, isMonthString, monthRange, todayString } from "../utils/dates.js";

// mini reception desk for habit-related patients
const router = Router();
const validStatuses = new Set<HabitLogStatus>(["done", "missed", "skipped"]);

router.use("/", habitsRouter);

// POST   /api/habits/:id/logs     save/update one daily log
router.post("/:id/logs", async (request, response, next) => {
  try {
    // if front-end sends no date, use today
    // if sends no status, use done
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

    // Upsert logic:
    // ON_CONFLICT bcz these fields were set as UNIQUE
    // DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note
    // Try to insert a log, if alr exists, dont crash just replace/update with new
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

// GET    /api/habits/:id/logs     get logs for a month
router.get("/:id/logs", async (request, response, next) => {
  try {
    // if no month is provided, todayString().slice(0,7) 
    // 2026-05-31 → 2026-05
    const month = request.query.month ?? todayString().slice(0, 7);

    if (!isMonthString(month)) {
      response.status(400).json({ message: "Month must use YYYY-MM format." });
      return;
    }

    const range = monthRange(month);
    /*
    Only get logs for this habit (WHERE ...)
      AND date is from month start
      AND date is before next month start
    */
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

// DELETE /api/habits/:id/logs     delete one daily log
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


// GET    /api/habits/:id/streak   calculate streak
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
