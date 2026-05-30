# Habit Tracker

A React, TypeScript, Tailwind CSS, Express, TypeScript, and PostgreSQL habit/streak tracker.

## What Is Included

- Fast habit creation.
- Daily habit logging.
- Monthly progress view.
- Current and highest streak summaries.
- 8am browser notification prompt.
- PostgreSQL schema for `habits` and `habit_logs`.
- API routes for habits, logs, and streaks.

## Setup

Install dependencies:

```bash
cd frontend
npm install

cd ../backend
npm install
```

Create the backend environment file:

```bash
cd backend
copy .env.example .env
```

Start PostgreSQL with Docker if Docker is available:

```bash
docker compose up -d
```

If you use your own PostgreSQL database, run `backend/database/schema.sql` and update `backend/.env`.

Start the API:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Open `http://127.0.0.1:5173`.

## API Routes

- `POST /api/habits`
- `GET /api/habits`
- `PUT /api/habits/:id`
- `POST /api/habits/:id/logs`
- `GET /api/habits/:id/logs?month=2026-05`
- `DELETE /api/habits/:id/logs?date=2026-05-30`
- `GET /api/habits/:id/streak`
