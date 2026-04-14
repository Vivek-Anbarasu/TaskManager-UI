# Task Manager App

A full-featured task management single-page application built with React, featuring AI-powered task assistance and document import capabilities.

## Features

- **Task Management** — Create, view, edit, and delete tasks with title, description, and status
- **AI Description Generation** — Generate a task description automatically from just a title
- **AI Status Suggestion** — Get an AI-recommended status based on task title and description
- **AI Task Breakdown** — Break a task down into actionable subtasks
- **AI Executive Summary** — Summarize all your tasks in a single snapshot
- **AI Chat Assistant** — Ask free-text questions about your tasks (e.g. "What should I work on next?")
- **Document Import** — Upload PDF, DOC, DOCX, or XLSX files and have tasks extracted automatically
- **Authentication** — JWT-based login with proactive silent token refresh
- **Password Strength Meter** — Live feedback during registration (Weak / Medium / Strong)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Routing | React Router DOM v7 |
| Build Tool | Vite 8 |
| HTTP Client | Axios |
| Table | TanStack React Table v8 |
| Notifications | React Toastify |
| Dialogs | React Confirm Alert |
| Testing | Vitest 4 + jsdom |
| Test Utilities | Testing Library (React, Jest DOM, User Event) |
| Coverage | Vitest Coverage V8 |
| Linting | ESLint 9 |

## Project Structure

```
src/
├── App.jsx                  # Root component: router + routes + toast container
├── main.jsx                 # React DOM entry point
├── components/
│   ├── LoginForm.jsx        # Login page
│   ├── RegistrationPage.jsx # Registration page with password strength meter
│   ├── Dashboard.jsx        # Main authenticated shell
│   ├── TaskForm.jsx         # Create/edit form with inline AI buttons
│   ├── TaskTable.jsx        # Data table with filtering, sorting, pagination
│   ├── AIChatPanel.jsx      # Slide-in AI chat modal
│   └── ImportModal.jsx      # File upload modal for document import
├── config/
│   ├── api.js               # Base URL + API endpoint factories
│   └── tokenManager.js      # JWT decode, proactive refresh scheduling
├── hooks/
│   ├── useAuth.js           # Auth state, auth header helper, logout
│   ├── useTaskActions.js    # Task CRUD state + API calls
│   └── useAI.js             # AI features state + API calls + document import
├── css/                     # Per-component stylesheets
└── test/                    # Vitest test files + setup
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A running backend API server

### Installation

```bash
npm install
```

### Environment Configuration

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Replace the value with the base URL of your backend API.

### Running the App

```bash
# Development server with hot module replacement
npm run dev

# Production build
npm run build

# Preview the production build locally
npm run preview
```

## Testing

```bash
# Run tests in watch mode
npm test

# Run tests once with V8 coverage report
npm run coverage
```

Coverage output is written to the `coverage/` directory.

## Linting

```bash
npm run lint
```

## API Overview

All endpoints are resolved from `VITE_API_BASE_URL`. Every request includes an `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/user/authenticate` | Login — JWT returned in `Authorization` response header |
| POST | `/user/register` | Register a new user |
| POST | `/user/refresh-token` | Exchange a near-expiry token for a fresh one |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/task/` | Fetch all tasks |
| POST | `/task/` | Create a task |
| PUT | `/task/` | Update a task |
| DELETE | `/task/:id` | Delete a task |

### AI

| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai/task/generate-description` | Generate a description from a title |
| POST | `/ai/task/suggest-status` | Suggest a status from title + description |
| POST | `/ai/task/breakdown` | Break a task into subtasks |
| GET | `/ai/task/summarize` | Executive summary of all tasks |
| POST | `/ai/task/chat` | Free-text Q&A about tasks |
| POST | `/ai/task/import-document` | Extract tasks from an uploaded document |

## Authentication Flow

1. User submits credentials → `POST /user/authenticate`
2. JWT is extracted from the `Authorization` response header and stored in `localStorage`
3. A proactive refresh timer is armed 2 minutes before the token expires
4. On page reload, `initRefreshOnLoad()` re-reads the stored token and re-arms the timer
5. On logout, the timer is cancelled and `localStorage` is cleared

## Task Statuses

| Status | Badge Color |
|---|---|
| `todo` | Default |
| `inprogress` | Blue |
| `done` | Green |
| `blocked` | Red |
