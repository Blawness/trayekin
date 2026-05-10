# Profitabilitas per Kendaraan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add settings page, km-based revenue calculation, and profitability reports with period selector.

**Architecture:** New `app_settings` table stores configurable rates. `daily_ledger` gains `km` column. Existing `service_records`, `kir_records`, `stnk_records` gain `cost` columns. Server actions handle data aggregation with manual batch queries (Neon-compatible). Reports page rebuilt with period selector and sortable table.

**Tech Stack:** Next.js 16.2.4 App Router, Drizzle ORM 0.45.2, Neon serverless, Tailwind CSS v4, shadcn/ui v4 (base-ui/react).

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/db/schema.ts` | Modify | Add `appSettings` table, `km` to `dailyLedger`, `cost` to 3 tables |
| `drizzle/` | Generate | New migration SQL via `pnpm drizzle-kit push` |
| `src/lib/actions/settings.ts` | Create | `getAppSettings`, `updateAppSettings` server actions |
| `src/lib/actions/profitability.ts` | Create | `getProfitabilityReport` server action |
| `src/lib/actions/ledger.ts` | Modify | Add `km` field handling, auto-calculate revenue |
| `src/app/(app)/settings/page.tsx` | Create | Settings page UI |
| `src/app/(app)/reports/page.tsx` | Modify | Full rewrite: period selector, summary cards, sortable table |
| `src/app/(app)/vehicles/[id]/_sections/ledger-form.tsx` | Modify | Add km input, auto-calculate revenue display |
| `src/app/(app)/vehicles/[id]/page.tsx` | Modify | Pass settings to ledger form, wire km field |

---

### Task 1: Database schema changes

**Files:**
- Modify: `src/lib/db/schema.ts`

- [ ] **Step 1: Add appSettings table and new columns to schema**

In `src/lib/db/schema.ts`, add after the existing table definitions (before the Relations section):

```ts
export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  type: text("type").default("string"),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

Add `serial` to the imports from `drizzle-orm/pg-core`.

Add `km` column to `dailyLedger`:

```ts
// Inside dailyLedger table definition, after the `notes` field:
km: integer("km"),
```

Add `cost` column to `serviceRecords`, `kirRecords`, and `stnkRecords`:

```ts
// In serviceRecords, after `notes`:
cost: integer("cost").default(0),

// In kirRecords, after `notes`:
cost: integer("cost").default(0),

// In stnkRecords, after `notes`:
cost: integer("cost").default(0),
```

- [ ] **Step 2: Run migration**

```bash
pnpm drizzle-kit push
```

Expected: Schema pushed successfully. If it asks for confirmation, type `yes`.

- [ ] **Step 3: Seed default app_settings**

```bash
psql "$DATABASE_URL" -c "
INSERT INTO app_settings (key, value, type) VALUES
  ('rate_per_km', '4500', 'number'),
  ('fuel_price_per_liter', '10000', 'number'),
  ('fuel_consumption_km_per_l', '10', 'number')
ON CONFLICT (key) DO NOTHING;
"
```

Expected: `INSERT 0 3` or `INSERT 0 0` if already exists.

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat: add app_settings table, km column, cost columns"
```

---

### Task 2: Settings server actions

**Files:**
- Create: `src/lib/actions/settings.ts`

- [ ] **Step 1: Create settings server actions**

Create `src/lib/actions/settings.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export type AppSetting = {
  key: string;
  value: string;
  type: string;
};

export async function getAppSettings(): Promise<AppSetting[]> {
  const session = await auth();
  if (!session?.user) return [];

  try {
    const rows = await db
      .select({ key: appSettings.key, value: appSettings.value, type: appSettings.type })
      .from(appSettings);
    return rows;
  } catch (error) {
    console.error("getAppSettings:", error);
    return [];
  }
}

export async function updateAppSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const ratePerKm = formData.get("rate_per_km") as string;
  const fuelPrice = formData.get("fuel_price_per_liter") as string;
  const fuelConsumption = formData.get("fuel_consumption_km_per_l") as string;

  const settings = [
    { key: "rate_per_km", value: ratePerKm },
    { key: "fuel_price_per_liter", value: fuelPrice },
    { key: "fuel_consumption_km_per_l", value: fuelConsumption },
  ];

  try {
    for (const s of settings) {
      await db
        .update(appSettings)
        .set({ value: s.value, updatedAt: new Date() })
        .where(eq(appSettings.key, s.key));
    }

    revalidatePath("/");
    revalidatePath("/settings");
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("updateAppSettings:", error);
    return { error: "Gagal menyimpan pengaturan." };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions/settings.ts
git commit -m "feat: add settings server actions"
```

---

### Task 3: Settings page UI

**Files:**
- Create: `src/app/(app)/settings/page.tsx`

- [ ] **Step 1: Create settings page**

Create `src/app/(app)/settings/page.tsx`:

```tsx
import { getAppSettings, updateAppSettings } from "@/lib/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatNumber(value: string): string {
  const num = parseInt(value, 10);
  return isNaN(num) ? "" : num.toLocaleString("id-ID");
}

export default async function SettingsPage() {
  const settings = await getAppSettings();
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const ratePerKm = settingsMap["rate_per_km"] || "4500";
  const fuelPrice = settingsMap["fuel_price_per_liter"] || "10000";
  const fuelConsumption = settingsMap["fuel_consumption_km_per_l"] || "10";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Pengaturan</h1>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-base">Biaya Transjakarta</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateAppSettings} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rate_per_km">Tarif per KM (Rp)</Label>
              <Input
                id="rate_per_km"
                name="rate_per_km"
                type="number"
                defaultValue={ratePerKm}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_price_per_liter">Harga BBM per Liter (Rp)</Label>
              <Input
                id="fuel_price_per_liter"
                name="fuel_price_per_liter"
                type="number"
                defaultValue={fuelPrice}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_consumption_km_per_l">Konsumsi BBM (km/liter)</Label>
              <Input
                id="fuel_consumption_km_per_l"
                name="fuel_consumption_km_per_l"
                type="number"
                defaultValue={fuelConsumption}
                required
              />
            </div>

            <Button type="submit">Simpan</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Add Settings link to bottom nav**

In `src/components/bottom-nav.tsx`, add a Settings link before the Laporan link:

```tsx
import { House, Truck, Users, BarChart3, Settings } from "lucide-react";
```

Add this nav item before the `/reports` link:

```tsx
<Link
  href="/settings"
  className={`flex flex-col items-center text-xs gap-1 transition-colors ${
    pathname.startsWith("/settings")
      ? "text-primary"
      : "text-muted-foreground"
  }`}
>
  <Settings className="h-5 w-5" />
  <span>Pengaturan</span>
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/settings/page.tsx src/components/bottom-nav.tsx
git commit -m "feat: add settings page and nav link"
```

---

### Task 4: Update ledger actions for km field

**Files:**
- Modify: `src/lib/actions/ledger.ts`

- [ ] **Step 1: Update addLedgerEntry to handle km and auto-calculate revenue**

In `src/lib/actions/ledger.ts`, modify the `addLedgerEntry` function:

```ts
export async function addLedgerEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const vehicleId = formData.get("vehicleId") as string;
  const driverId = formData.get("driverId") as string;
  const dateStr = formData.get("date") as string;
  const kmStr = formData.get("km") as string;
  const revenueStr = formData.get("revenue") as string;
  const expensesStr = formData.get("expenses") as string;
  const notes = formData.get("notes") as string;

  if (!vehicleId || !dateStr) return { error: "Data tidak lengkap." };

  const km = kmStr ? parseInt(kmStr, 10) : null;

  // Auto-calculate revenue from km if provided, otherwise use manual input
  let revenue = 0;
  if (km && km > 0) {
    const settings = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, "rate_per_km"));
    const ratePerKm = settings.length > 0 ? parseInt(settings[0].value, 10) : 4500;
    revenue = km * ratePerKm;
  } else {
    revenue = parseInt(revenueStr, 10) || 0;
  }

  try {
    await db.insert(dailyLedger).values({
      vehicleId,
      driverId: driverId || null,
      date: dateStr,
      km,
      revenue,
      expenses: parseInt(expensesStr, 10) || 0,
      notes: notes || null,
    });

    revalidatePath("/");
    revalidatePath(`/vehicles/${vehicleId}`);
    revalidatePath("/reports");
    revalidatePath("/drivers");
    return { success: true };
  } catch (error) {
    console.error("addLedgerEntry:", error);
    return { error: "Gagal menyimpan setoran." };
  }
}
```

Add imports at the top:

```ts
import { appSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
```

(If `eq` is not already imported — it already is, so just add the `appSettings` import.)

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions/ledger.ts
git commit -m "feat: add km field and auto-revenue calculation to ledger"
```

---

### Task 5: Update ledger form UI for km field

**Files:**
- Modify: `src/app/(app)/vehicles/[id]/_sections/ledger-form.tsx`
- Modify: `src/app/(app)/vehicles/[id]/page.tsx`

- [ ] **Step 1: Update LedgerFormSection to accept settings and show km field**

Modify `src/app/(app)/vehicles/[id]/_sections/ledger-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { getDrivers } from "@/lib/actions/drivers";

type Driver = Awaited<ReturnType<typeof getDrivers>>[number];

type Props = {
  vehicleId: string;
  drivers: Driver[];
  action: (formData: FormData) => void;
  ratePerKm: number;
};

export function LedgerFormSection({ vehicleId, drivers, action, ratePerKm }: Props) {
  const [km, setKm] = useState("");
  const [manualRevenue, setManualRevenue] = useState("");
  const autoRevenue = km ? parseInt(km, 10) * ratePerKm : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">Catat Setoran Harian</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          <input type="hidden" name="vehicleId" value={vehicleId} />
          <input type="hidden" name="km" value={km} />
          <input type="hidden" name="revenue" value={autoRevenue ?? manualRevenue} />
          <div className="space-y-2">
            <Label htmlFor="ledgerDate">Tanggal</Label>
            <Input id="ledgerDate" name="date" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="driverId">Sopir</Label>
            <select
              id="driverId"
              name="driverId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">-- Pilih sopir --</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="km">KM Tempuh</Label>
            <Input
              id="km"
              name="km_input"
              type="number"
              placeholder="Kosongkan jika input manual"
              value={km}
              onChange={(e) => setKm(e.target.value)}
            />
          </div>
          {autoRevenue !== null && (
            <div className="text-sm text-muted-foreground">
              Pendapatan: Rp {autoRevenue.toLocaleString("id-ID")} ({km} km × Rp {ratePerKm.toLocaleString("id-ID")}/km)
            </div>
          )}
          {autoRevenue === null && (
            <div className="space-y-2">
              <Label htmlFor="manualRevenue">Pendapatan (Rp)</Label>
              <Input
                id="manualRevenue"
                type="number"
                placeholder="0"
                value={manualRevenue}
                onChange={(e) => setManualRevenue(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="expenses">Pengeluaran (Rp)</Label>
            <Input id="expenses" name="expenses" type="number" placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ledgerNotes">Catatan</Label>
            <Input id="ledgerNotes" name="notes" placeholder="Supir, BBM, parkir..." />
          </div>
          <Button type="submit" size="sm">
            Simpan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

Note: This is a client component now (`"use client"`) because it needs interactive state for km/revenue calculation.

- [ ] **Step 2: Update vehicle detail page to pass ratePerKm**

In `src/app/(app)/vehicles/[id]/page.tsx`, add the settings fetch and pass ratePerKm to LedgerFormSection.

Add import:

```ts
import { getAppSettings } from "@/lib/actions/settings";
```

In the page function, add to the Promise.all:

```ts
const [ledgerEntries, partList, driverList, settingsList] = await Promise.all([
  getLedgerEntries(id),
  getPartReplacements(id),
  getDrivers(),
  getAppSettings(),
]);
```

Calculate ratePerKm:

```ts
const settingsMap = Object.fromEntries(settingsList.map((s) => [s.key, s.value]));
const ratePerKm = parseInt(settingsMap["rate_per_km"] || "4500", 10);
```

Update the LedgerFormSection usage:

```tsx
<LedgerFormSection vehicleId={vehicle.id} drivers={driverList} action={addLedger} ratePerKm={ratePerKm} />
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/vehicles/\[id\]/_sections/ledger-form.tsx src/app/\(app\)/vehicles/\[id\]/page.tsx
git commit -m "feat: add km input and auto-revenue to ledger form"
```

---

### Task 6: Profitability report server action

**Files:**
- Create: `src/lib/actions/profitability.ts`

- [ ] **Step 1: Create profitability server action**

Create `src/lib/actions/profitability.ts`:

```ts
"use server";

import { db } from "@/lib/db";
import {
  vehicles,
  dailyLedger,
  serviceRecords,
  partReplacements,
  kirRecords,
  stnkRecords,
  appSettings,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, inArray, and, gte, lte } from "drizzle-orm";

export type ProfitabilityRow = {
  vehicleId: string;
  plate: string;
  name: string;
  totalKm: number;
  revenue: number;
  costService: number;
  costParts: number;
  costKir: number;
  costStnk: number;
  costFuel: number;
  totalCost: number;
  netProfit: number;
  marginPercent: number;
};

export async function getProfitabilityReport(
  periodStart: string,
  periodEnd: string
): Promise<ProfitabilityRow[]> {
  const session = await auth();
  if (!session?.user) return [];

  try {
    // Fetch settings
    const settingsRows = await db.select().from(appSettings);
    const settingsMap = Object.fromEntries(settingsRows.map((s) => [s.key, parseInt(s.value, 10)]));
    const ratePerKm = settingsMap["rate_per_km"] || 4500;
    const fuelPrice = settingsMap["fuel_price_per_liter"] || 10000;
    const fuelConsumption = settingsMap["fuel_consumption_km_per_l"] || 10;

    const periodDays =
      (new Date(periodEnd).getTime() - new Date(periodStart).getTime()) / (1000 * 60 * 60 * 24);

    // Fetch vehicles
    const vehicleList = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.userId, session.user.id!));

    if (vehicleList.length === 0) return [];

    const vehicleIds = vehicleList.map((v) => v.id);

    // Fetch ledger entries in period
    const ledgerEntries = await db
      .select()
      .from(dailyLedger)
      .where(and(inArray(dailyLedger.vehicleId, vehicleIds), gte(dailyLedger.date, periodStart), lte(dailyLedger.date, periodEnd)));

    // Fetch service records in period
    const services = await db
      .select()
      .from(serviceRecords)
      .where(and(inArray(serviceRecords.vehicleId, vehicleIds), gte(serviceRecords.serviceDate, periodStart), lte(serviceRecords.serviceDate, periodEnd)));

    // Fetch part replacements in period
    const parts = await db
      .select()
      .from(partReplacements)
      .where(and(inArray(partReplacements.vehicleId, vehicleIds), gte(partReplacements.date, periodStart), lte(partReplacements.date, periodEnd)));

    // Fetch KIR records that overlap with period
    const kirList = await db
      .select()
      .from(kirRecords)
      .where(and(inArray(kirRecords.vehicleId, vehicleIds), lte(kirRecords.startDate, periodEnd), gte(kirRecords.endDate, periodStart)));

    // Fetch STNK records that overlap with period
    const stnkList = await db
      .select()
      .from(stnkRecords)
      .where(and(inArray(stnkRecords.vehicleId, vehicleIds), lte(stnkRecords.startDate, periodEnd), gte(stnkRecords.endDate, periodStart)));

    // Calculate per vehicle
    return vehicleList.map((v) => {
      const vLedger = ledgerEntries.filter((e) => e.vehicleId === v.id);
      const vServices = services.filter((s) => s.vehicleId === v.id);
      const vParts = parts.filter((p) => p.vehicleId === v.id);
      const vKir = kirList.filter((k) => k.vehicleId === v.id);
      const vStnk = stnkList.filter((s) => s.vehicleId === v.id);

      const totalKm = vLedger.reduce((sum, e) => sum + (e.km || 0), 0);
      const revenue = vLedger.reduce((sum, e) => {
        if (e.km && e.km > 0) return sum + e.km * ratePerKm;
        return sum + e.revenue;
      }, 0);

      const costService = vServices.reduce((sum, s) => sum + (s.cost || 0), 0);
      const costParts = vParts.reduce((sum, p) => sum + p.cost, 0);

      // KIR prorata: cost / actual_days × days_in_period
      const costKir = vKir.reduce((sum, k) => {
        const actualDays =
          (new Date(k.endDate).getTime() - new Date(k.startDate).getTime()) / (1000 * 60 * 60 * 24);
        if (actualDays <= 0) return sum;
        return sum + ((k.cost || 0) / actualDays) * periodDays;
      }, 0);

      // STNK prorata: cost / actual_days × days_in_period
      const costStnk = vStnk.reduce((sum, s) => {
        const actualDays =
          (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / (1000 * 60 * 60 * 24);
        if (actualDays <= 0) return sum;
        return sum + ((s.cost || 0) / actualDays) * periodDays;
      }, 0);

      const costFuel = totalKm > 0 ? (totalKm / fuelConsumption) * fuelPrice : 0;

      const totalCost = costService + costParts + costKir + costStnk + costFuel;
      const netProfit = revenue - totalCost;
      const marginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      return {
        vehicleId: v.id,
        plate: v.plate,
        name: v.name || "Tanpa nama",
        totalKm,
        revenue,
        costService,
        costParts,
        costKir: Math.round(costKir),
        costStnk: Math.round(costStnk),
        costFuel: Math.round(costFuel),
        totalCost: Math.round(totalCost),
        netProfit: Math.round(netProfit),
        marginPercent: Math.round(marginPercent * 100) / 100,
      };
    });
  } catch (error) {
    console.error("getProfitabilityReport:", error);
    return [];
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions/profitability.ts
git commit -m "feat: add profitability report server action"
```

---

### Task 7: Rebuild reports page with period selector and sortable table

**Files:**
- Modify: `src/app/(app)/reports/page.tsx`

- [ ] **Step 1: Rewrite reports page**

Replace the entire contents of `src/app/(app)/reports/page.tsx`:

```tsx
import { getProfitabilityReport } from "@/lib/actions/profitability";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type SortKey = "plate" | "revenue" | "totalCost" | "netProfit" | "marginPercent";
type SortDir = "asc" | "desc";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; sort?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const period = params.period || "30";
  const sortKey = (params.sort as SortKey) || "revenue";
  const sortDir = (params.dir as SortDir) || "desc";

  const now = new Date();
  const days = parseInt(period, 10);
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const periodStart = start.toISOString().split("T")[0];
  const periodEnd = now.toISOString().split("T")[0];

  const rows = await getProfitabilityReport(periodStart, periodEnd);

  // Filter: only vehicles with activity in period
  const activeRows = rows.filter(
    (r) => r.totalKm > 0 || r.revenue > 0 || r.totalCost > 0
  );

  // Sort
  const sorted = [...activeRows].sort((a, b) => {
    const aVal = a[sortKey as keyof typeof a];
    const bVal = b[sortKey as keyof typeof b];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const totalRevenue = sorted.reduce((s, r) => s + r.revenue, 0);
  const totalCost = sorted.reduce((s, r) => s + r.totalCost, 0);
  const fleetMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

  const periods = [
    { label: "30 Hari", value: "30" },
    { label: "60 Hari", value: "60" },
    { label: "90 Hari", value: "90" },
  ];

  function sortUrl(key: SortKey) {
    const newDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    return `/reports?period=${period}&sort=${key}&dir=${newDir}`;
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "↕";
    return sortDir === "asc" ? "↑" : "↓";
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="font-medium">Belum ada data kendaraan.</p>
        <p className="text-sm">Tambah kendaraan untuk melihat laporan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Laporan Profitabilitas</h1>

      {/* Period Selector */}
      <div className="flex gap-2">
        {periods.map((p) => (
          <Link
            key={p.value}
            href={`/reports?period=${p.value}`}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              period === p.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground">Total Pendapatan</div>
            <div className="text-xl font-bold text-green-600 mt-1">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground">Total Biaya</div>
            <div className="text-xl font-bold text-red-600 mt-1">
              Rp {totalCost.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground">Fleet Margin</div>
            <div className={`text-xl font-bold mt-1 ${fleetMargin >= 0 ? "text-blue-600" : "text-red-600"}`}>
              {fleetMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Vehicle Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 pr-2">
                <Link href={sortUrl("plate")} className="hover:text-foreground">
                  Plat {sortIndicator("plate")}
                </Link>
              </th>
              <th className="pb-2 pr-2 text-right">KM</th>
              <th className="pb-2 pr-2 text-right">
                <Link href={sortUrl("revenue")} className="hover:text-foreground">
                  Pendapatan {sortIndicator("revenue")}
                </Link>
              </th>
              <th className="pb-2 pr-2 text-right">Service</th>
              <th className="pb-2 pr-2 text-right">Parts</th>
              <th className="pb-2 pr-2 text-right">KIR</th>
              <th className="pb-2 pr-2 text-right">STNK</th>
              <th className="pb-2 pr-2 text-right">BBM</th>
              <th className="pb-2 pr-2 text-right">
                <Link href={sortUrl("totalCost")} className="hover:text-foreground">
                  Total Biaya {sortIndicator("totalCost")}
                </Link>
              </th>
              <th className="pb-2 pr-2 text-right">
                <Link href={sortUrl("netProfit")} className="hover:text-foreground">
                  Bersih {sortIndicator("netProfit")}
                </Link>
              </th>
              <th className="pb-2 text-right">
                <Link href={sortUrl("marginPercent")} className="hover:text-foreground">
                  Margin {sortIndicator("marginPercent")}
                </Link>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.vehicleId} className="border-b last:border-0">
                <td className="py-2 pr-2 font-medium">
                  <Link href={`/vehicles/${r.vehicleId}`} className="hover:underline">
                    {r.plate}
                  </Link>
                </td>
                <td className="py-2 pr-2 text-right">{r.totalKm || "-"}</td>
                <td className="py-2 pr-2 text-right text-green-600">
                  {r.revenue > 0 ? `Rp ${r.revenue.toLocaleString("id-ID")}` : "-"}
                </td>
                <td className="py-2 pr-2 text-right">
                  {r.costService > 0 ? `Rp ${r.costService.toLocaleString("id-ID")}` : "-"}
                </td>
                <td className="py-2 pr-2 text-right">
                  {r.costParts > 0 ? `Rp ${r.costParts.toLocaleString("id-ID")}` : "-"}
                </td>
                <td className="py-2 pr-2 text-right">
                  {r.costKir > 0 ? `Rp ${r.costKir.toLocaleString("id-ID")}` : "-"}
                </td>
                <td className="py-2 pr-2 text-right">
                  {r.costStnk > 0 ? `Rp ${r.costStnk.toLocaleString("id-ID")}` : "-"}
                </td>
                <td className="py-2 pr-2 text-right">
                  {r.costFuel > 0 ? `Rp ${r.costFuel.toLocaleString("id-ID")}` : "-"}
                </td>
                <td className="py-2 pr-2 text-right text-red-600">
                  Rp {r.totalCost.toLocaleString("id-ID")}
                </td>
                <td className="py-2 pr-2 text-right">
                  <span className={r.netProfit >= 0 ? "text-blue-600" : "text-red-600"}>
                    Rp {r.netProfit.toLocaleString("id-ID")}
                  </span>
                </td>
                <td className="py-2 text-right">
                  <Badge className={r.marginPercent >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {r.marginPercent.toFixed(1)}%
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Tidak ada aktivitas dalam periode ini.</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(app\)/reports/page.tsx
git commit -m "feat: rebuild reports page with period selector and sortable table"
```

---

### Task 8: Verify build passes

- [ ] **Step 1: Run build (includes typecheck)**

```bash
pnpm build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 2: Run lint**

```bash
pnpm lint
```

Expected: No lint errors. Fix any issues if they appear.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: address build/lint issues"
```
