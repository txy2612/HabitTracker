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
docker compose up --build
```

Open:

```bash
http://127.0.0.1:5173
```

API health:

```bash
http://127.0.0.1:4000/api/health
```

## Local development without Docker

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# Create environment file
copy .env.example .env

# Start PostgreSQL only
cd ..
docker compose up -d postgres

# Start backend
cd backend
npm run dev

# Start frontend
cd ../frontend
npm run dev
```


