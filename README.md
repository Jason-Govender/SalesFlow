# SalesFlow

A modern sales automation frontend built with Next.js and React. SalesFlow connects to a Sales Automation API to manage clients, opportunities, proposals, pricing requests, contracts, activities, and more—with a role-based dashboard and a consistent UI built on Ant Design.

## Features

- **Authentication** — Login and registration with session persistence and route guards
- **Dashboard** — Overview metrics, pipeline summary, and activity widgets (ZAR currency support)
- **Clients** — List, detail, and create clients with related contacts, opportunities, and contracts
- **Contacts** — Contact management with primary-contact handling, integrated in client views
- **Opportunities** — Pipeline/Kanban view, stage history, and opportunity details
- **Proposals** — Create and edit proposals with line items; submit, approve, and reject workflows
- **Pricing requests** — Queue views (pending, my requests) and assignment flows
- **Contracts** — Contract list and details with renewal and expiring-contract summaries
- **Activities** — Tasks and events; reusable across entities and dashboard
- **Documents & notes** — Upload/list documents and manage notes with privacy options
- **Reports** — Opportunity and sales-by-period reporting (when enabled)

The app uses **role-based access**: routes are guarded by `hasAccess(session.user.roles, pathname)` so only authorized roles see protected pages.

## Tech stack

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router)
- **UI:** [React](https://react.dev/) 19, [Ant Design](https://ant.design/) 6, [antd-style](https://ant-design.github.io/antd-style/)
- **HTTP:** [Axios](https://axios-http.com/) with a shared instance and auth interceptors
- **State:** Redux-style actions/reducers via [redux-actions](https://redux-actions.github.io/redux-actions/) and React context (Auth, Dashboard, Clients, Contacts, Opportunities, Proposals, Pricing Requests, Contracts, Activities)
- **Language:** [TypeScript](https://www.typescriptlang.org/) 5

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- A running **Sales Automation API** (see your API docs for setup). The frontend expects this API to be available at the URL you set in the environment.

## Environment variables

Create a `.env.local` in the project root (or set these in your deployment environment):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the Sales Automation API (e.g. `http://localhost:5053` or your production API URL). |

> Keep secrets out of `NEXT_PUBLIC_*`; this project only needs the API base URL on the client.

## Getting started

1. **Clone and install**

   ```bash
   git clone <repository-url>
   cd salesflow
   npm install
   ```

2. **Configure environment**

   Create `.env.local` in the project root and set your API base URL:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5053
   ```

   Replace with your actual Sales Automation API URL.

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Use the login/register flows; the app will redirect unauthenticated users to `/login` and enforce role-based access on protected routes.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server (run after `npm run build`) |
| `npm run lint` | Run ESLint |

## Project structure (high level)

- **`app/`** — Next.js App Router: `(auth)/` (login, register), `(app)/` (dashboard, clients, opportunities, proposals, pricing-requests, activities, etc.)
- **`components/`** — Feature UI: `app-shell`, `dashboard/`, `clients/`, `contacts/`, `opportunities/`, `proposals/`, `pricing-requests/`, `activities/`, etc.
- **`providers/`** — React context + Redux-style reducers: auth, dashboard, clients, contacts, opportunities, proposals, pricing-requests, contracts, activities
- **`utils/`** — Shared code: `axios-instance`, `auth-session-storage`, `auth-service`, `auth-events`, and domain services (`*-service.tsx`) that call the API
- **`docs/`** — Implementation plan and API cheatsheet for the Sales Automation API

Data flow follows **UI → Provider → Service → API**: components use provider hooks; providers dispatch actions and call service functions; services use the shared Axios instance to talk to the backend.

## License

Private. All rights reserved.
