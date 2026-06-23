# Video Netflix Starter

This workspace contains a starter full-stack project for a personal "Netflix-style" video site.

Structure:
- `frontend/` — React + Vite frontend (Tailwind + HLS.js)
- `backend/` — FastAPI backend (SQLModel) that serves profiles, videos, and static media
- `docker-compose.yml` — Postgres and backend service for local development

Quick start (development):

1) Backend: run with Docker Compose (recommended)

```bash
docker-compose up --build
```

This starts Postgres and the backend at `http://localhost:8000`. The backend mounts `./media` at `/media` — place your video files (eg `sample.mp4`) there.

2) Frontend: open a separate terminal and run the frontend dev server

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the API at `/api/*` on the same host/port; when running locally you may need to set proxy settings or open the frontend at `http://localhost:5173` and the backend at `http://localhost:8000` (CORS is allowed).
