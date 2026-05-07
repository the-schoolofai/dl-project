# DL Image Classifier — Frontend

Next.js 14 (App Router) dashboard for the FastAPI inference service in
[`../backend`](../backend). Built with React 18, TypeScript, and Tailwind CSS 3.
The visual language follows [`../DESIGN.md`](../DESIGN.md).

## Quick start

```bash
cd frontend
npm install
cp .env.local.example .env.local   # adjust if backend is not on :8000
npm run dev                        # http://localhost:3000
```

The backend should be running first:

```bash
cd backend
uv run fastapi dev app/main.py     # http://localhost:8000
```

## Configuration

| variable                  | default                            |
| ------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`| `http://localhost:8000/api/v1`     |

CORS is open on the backend (`APP_CORS_ORIGINS=["*"]`), so the browser calls
the API directly — no Next.js proxy.

## Layout

```
src/
├── app/
│   ├── layout.tsx       Root layout + global gradient
│   ├── page.tsx         Composes the dashboard grid + state
│   └── globals.css      Tailwind directives + custom range thumb
├── components/
│   ├── Card.tsx               Standard card shell (default / empty / error)
│   ├── HealthBadge.tsx        Polled status pill (10 s)
│   ├── PredictionForm.tsx     Drag-and-drop image input
│   ├── PredictionResult.tsx   Hero label + confidence + probability bars
│   ├── PredictionHistory.tsx  Tabular log, capped at 20 entries
│   └── StatsPanel.tsx         2×2 facts + class distribution
├── hooks/useHealth.ts   /health poller
└── lib/
    ├── api.ts           predict() / getHealth()
    ├── format.ts        percent / ms / time helpers
    └── types.ts         API + history shapes
```

## Design notes

- Palette, typography, spacing, and motion are governed by `DESIGN.md`.
- The form is image-upload first (matching the real `POST /api/v1/predict`
  contract) rather than the numeric `F1..F4` sliders sketched in early design
  drafts. All other component patterns map 1:1.
- Every async surface defines empty / loading / error / success states.
- History is in-memory only; promote to `localStorage` without changing the
  `HistoryEntry` shape.

## Scripts

| command            | description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Dev server with HMR                  |
| `npm run build`    | Production build                     |
| `npm start`        | Serve the production build           |
| `npm run lint`     | `next lint`                          |
| `npm run typecheck`| `tsc --noEmit`                       |
