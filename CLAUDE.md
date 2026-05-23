# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Domain

Trayekin is a fleet management app for Indonesian vehicle operators. It tracks:

- **Compliance deadlines**: KIR (roadworthiness inspection, 6-month cycle), STNK (registration tax: tahunan/lima_tahunan/asuransi), and service records (3-month default cycle)
- **Daily ledger**: per-vehicle daily income/expense entries. Revenue is either entered directly or auto-calculated as `km × rate_per_km`
- **Part replacements**: logged with optional odometer and lifespan for next-replacement tracking
- **Profitability reports**: per-vehicle P&L with prorated KIR/STNK costs and fuel cost derived from km

All data is user-scoped (multi-tenant). Every server action calls `auth()` first and filters by `session.user.id`. Access control for vehicle detail pages checks `vehicle.userId === session.user.id` explicitly.

## Key Patterns

### Status system
`src/lib/utils/status.ts` exports `getStatus(date)` → `"aman"` (>30 days), `"mendekati"` (≤30 days), `"terlambat"` (past). Used for badge colors on KIR/STNK/service deadlines everywhere.

### appSettings table
Global key-value config (not per-user). Keys: `rate_per_km`, `fuel_price_per_liter`, `fuel_consumption_km_per_l`. Read in profitability calculations and on the vehicle detail page for ledger auto-revenue. Defaults are 4500, 10000, 10 if rows are missing.

### Ledger revenue dual-mode
A ledger entry either uses `km > 0` (auto-revenue = `km × rate_per_km`) or an explicit `revenue` field. The profitability report applies the same logic: `if (e.km && e.km > 0) return sum + e.km * ratePerKm; return sum + e.revenue`.

### Profitability cost calculation
- Service and parts: summed directly from records in the date range
- KIR and STNK: **prorated** — `(cost / record_duration_days) × period_days` — because records span multiple periods
- Fuel cost: `(totalKm / fuelConsumption) × fuelPrice` — derived, never stored

### Page sections pattern
`src/app/(app)/vehicles/[id]/_sections/` holds client components for complex sections (ledger form, ledger history, part form, part history). Server actions are wrapped in inline `"use server"` functions in the page and passed as props to avoid client-bundling the action imports.

### Revalidation
Server actions call `revalidatePath("/")` and the relevant route (e.g., `revalidatePath("/vehicles")`) after mutations. No optimistic updates.

## Route Map

```
/                    → dashboard (vehicle list + status badges)
/vehicles/new        → add vehicle (with optional initial KIR/service)
/vehicles/[id]       → vehicle detail: KIR/STNK/service forms + ledger + parts
/drivers             → driver list
/drivers/new         → add driver
/drivers/[id]        → driver detail
/reports             → profitability table (period selector + sortable columns via searchParams)
/settings            → appSettings editor
/login, /register    → public auth pages
```

## Notifications Flow

Cron job (`/api/cron/check-reminders`, daily midnight UTC) queries upcoming KIR/STNK/service/part deadlines, writes rows to the `notifications` table, and sends web-push to all subscribed devices for that user. The `NotificationBell` component polls/displays unread notifications; `isRead` timestamp marks them as read.
