# Habit Tracker

A full-stack habit tracking application built with React, TypeScript, Express, and PostgreSQL.

## Features

* Create and manage habits
* Daily habit logging
* Monthly progress view
* Current and highest streak tracking
* Personalized email reminders

## Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS

### Backend

* Express
* TypeScript
* PostgreSQL

## Architecture

### Backend

* Controller – request handling
* Service – business logic
* Repository – database access
* Schema – validation

### Frontend

* Pages
* Components
* Hooks
* Shared TypeScript contracts

## Setup

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

Create environment file:

```bash
cd backend
copy .env.example .env
```

Start PostgreSQL:

```bash
docker compose up -d
```

Start backend:

```bash
cd backend
npm run dev
```

Start frontend:

```bash
cd frontend
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```


