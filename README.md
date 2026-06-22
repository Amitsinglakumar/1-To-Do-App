# TaskFlow

TaskFlow is a focused MERN task management workspace with email and Google sign-in, user-scoped tasks, priorities, categories, due dates, search, filters, progress tracking, and a responsive dashboard.

## Features

- JWT authentication with register, login, session restore, and Google Identity Services
- Private task CRUD with ownership checks on every API operation
- Priority, status, category, due date and time, estimate, and tags
- Search, status/priority/category filters, due views, and sorting
- Dashboard totals, completion rate, overdue tasks, and due-soon stats
- Accessible create/edit and delete confirmation dialogs
- Responsive desktop sidebar and mobile navigation

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` and `JWT_SECRET`.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. Run `npm install` in both `backend` and `frontend`.
4. Run `npm run dev` in each folder.

The frontend runs at `http://localhost:5173`; the API runs at `http://localhost:5000`.

## Google Sign-In

Create an OAuth 2.0 Web Client in Google Cloud, add the frontend origin to its authorized JavaScript origins, then put the same client ID in:

- `backend/.env` as `GOOGLE_CLIENT_ID`
- `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`

Without these values, email/password authentication remains fully available and the UI marks Google Sign-In as requiring setup.

## API

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/google
GET    /api/auth/me

GET    /api/tasks
GET    /api/tasks/:id
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id

GET    /api/dashboard/stats
GET    /api/health
```

Task routes and dashboard stats require `Authorization: Bearer <token>`.

## Deployment

- Deploy `frontend` to Vercel and set `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID`.
- Deploy `backend` to Render and set `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, and `CLIENT_URL`.
- Set `CLIENT_URL` to the deployed frontend origin. Multiple comma-separated origins are supported.
