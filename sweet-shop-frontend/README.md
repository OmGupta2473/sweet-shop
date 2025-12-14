# Sweet Shop Frontend

This is a React + Vite frontend for the Sweet Shop backend.

Setup

- Install dependencies: `npm install`
- Run the dev server: `npm run dev` (default port 5173)

Configuration

- Edit `.env` to set `VITE_API_BASE` (defaults to `http://localhost:5000/api`)

Features

- JWT auth (login/register)
- Dashboard listing sweets
- Search by name, category, price range
- Purchase sweets
- Admin panel for create/update/delete/restock sweets

Design
- Tailwind CSS
- Framer Motion animations

Notes
- Admin role must be granted from the backend (DB). The frontend will show the Admin route if token claims include role `admin`.

