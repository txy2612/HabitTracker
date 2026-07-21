# Habit Tracker

A full-stack habit-tracking application that helps users build routines, record daily progress, monitor streaks, and understand their consistency over time.

## Live Demo

🔗 **[Try the deployed application](https://habit-tracker-xoxk.vercel.app/)**

> The first request may take a moment if the backend is waking up.

## Features

- Create, edit, archive, and restore habits
- Mark habits as completed for each day
- View habit activity in a monthly calendar
- Track current and longest streaks
- Review completion rates for the last 7 and 30 days
- View weekly completion trends
- Navigate between individual habit analytics
- Configure habit reminders
- Responsive interface for desktop and mobile
- Persistent data storage with PostgreSQL

## Screenshots

Add screenshots of your application here:

| Dashboard | Habit Analytics |
|---|---|
| ![Dashboard](./screenshots/dashboard.png) | ![Habit analytics](./screenshots/analytics.png) |

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- Zod for request validation
- Pino for structured logging

### Development and Deployment

- Docker and Docker Compose
- Vercel
- Git and GitHub

## Project Structure

```text
HabitTracker/
├── frontend/        # React frontend
├── backend/         # Express API and business logic
├── docker-compose.yml
└── vercel.json
