  <!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

- **dev**: `pnpm dev`
- **build** (includes typecheck): `pnpm build`
- **lint**: `pnpm lint`
- **DB migrate**: `pnpm drizzle-kit push` (connect to `DATABASE_URL` from `.env.local`)
- **Generate VAPID keys**: `npx web-push generate-vapid-keys`
- **Generate AUTH_SECRET**: `openssl rand -base64 32`

No test or typecheck commands exist — typecheck runs inside `next build`.

## Stack

- **Next.js 16.2.4** (App Router, Turbopack) + **React 19.2.4**
- **Tailwind CSS v4** — CSS-first config in `src/app/globals.css`. No `tailwind.config.ts`. Uses `@theme inline`, `@custom-variant`, `@utility`.
- **shadcn/ui v4** with `base-nova` style (`components.json`). UI primitives from `@base-ui/react` (NOT Radix). Icons: `lucide-react`.
- **Drizzle ORM 0.45.2** — schema at `src/lib/db/schema.ts`, migrations in `drizzle/`.
- **NextAuth.js v5** (beta 31) — credentials provider, JWT sessions. Middleware at `src/proxy.ts`.
- **Neon serverless** (`@neondatabase/serverless` HTTP driver). No local PostgreSQL.

## Environment

Copy `.env.example` to `.env.local`. Required vars:
`DATABASE_URL`, `AUTH_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.

## Architecture

- `src/app/(app)/` — authenticated routes (protected by middleware)
- `src/app/login/`, `src/app/register/` — public auth pages
- `src/app/api/` — auth, cron, push subscription endpoints
- Server Components by default. Client components marked `"use client"`.
- Server actions in `src/lib/actions/` for mutations.
- All UI text in Indonesian.

## Critical: Drizzle relational queries break on Neon HTTP

**Never use `db.query.vehicles.findMany({ with: { kirRecords: ... } })`**. Drizzle generates lateral joins with conflicting `ORDER BY` subqueries that fail on the Neon HTTP driver.

Instead, use manual batch queries:

```ts
const vehicles = await db.select().from(vehicles).where(...)
const ids = vehicles.map(v => v.id)
const allKir = await db.select().from(kirRecords).where(inArray(kirRecords.vehicleId, ids)).orderBy(desc(kirRecords.startDate))
// Then group in JS: vehicles.map(v => ({ ...v, kirRecords: allKir.filter(k => k.vehicleId === v.id) }))
```

See `src/lib/actions/vehicles.ts` and `src/lib/actions/notifications.ts` for examples.

## React 19 lint: set-state-in-effect

React 19 enforces `react-hooks/set-state-in-effect`. When initializing state from browser APIs (localStorage, Notification, matchMedia), place `// eslint-disable-next-line react-hooks/set-state-in-effect` directly above the `setState` call, not above `useEffect`.

## Cron

Vercel cron (`vercel.json`) hits `/api/cron/check-reminders` daily at midnight UTC. Authenticated via `Bearer $CRON_SECRET` header.

## Push Notifications

Client subscribes via `PushSubscribe` component → `POST /api/push/subscribe`. Service worker at `public/sw.js`. VAPID keys must match between env and client subscription.
