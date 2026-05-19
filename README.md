# Digital Waiter System

Full-stack restaurant ordering platform with React, Express, MongoDB, and Socket.IO.

## Structure

- `frontend/` React + Vite customer, chef, and admin UI
- `backend/` Express + Mongoose API
- `database/` schema docs and seed data
- `docs/` project documentation

## Run

1. Install dependencies in `backend/` and `frontend/`
2. Set up `.env` files
3. Run `npm run dev` from the repository root

Note: Inventory and recipe management were removed from the codebase and replaced by a lightweight Expenses tracking system (backend `Expense` model and endpoints). Remove any references to `/api/inventory` when deploying or update your frontend to use expenses endpoints.
