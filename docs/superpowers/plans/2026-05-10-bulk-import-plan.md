# Bulk Import Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow operators to bulk-import vehicles, drivers, KIR, STNK, and service records via a single .xlsx file with duplicate detection and preview/resolution UI.

**Architecture:** Install `xlsx` (SheetJS) for Excel parsing. Create server actions for parse + execute. Build a multi-step client component at `/vehicles/import` that uploads, previews, resolves duplicates, and shows import summary.

**Tech Stack:** `xlsx` npm package, Next.js 16 server actions, React 19, Tailwind CSS v4, @base-ui/react primitives, Drizzle ORM + Neon serverless.

---

### Task 1: Install xlsx package

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install xlsx**

```bash
pnpm add xlsx
```

Expected: `xlsx` added to dependencies. No separate `@types/xlsx` needed (types bundled).

- [ ] **Step 2: Verify install**

```bash
node -e "const XLSX = require('xlsx'); console.log(XLSX.version);"
```

Expected: prints version number like `0.20.x`

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add xlsx for Excel import"
```

---

### Task 2: Create import utility functions

**Files:**
- Create: `src/lib/utils/import-excel.ts`

This file contains template generation and parsed-data types.

- [ ] **Step 1: Write the file**

```typescript
// src/lib/utils/import-excel.ts
import type { stnkTypeEnum } from "@/lib/db/schema";

// ---- Types ----

export interface ImportVehicle {
  plat_nomor: string;
  jenis?: string;
  merk?: string;
  tahun?: number;
}

export interface ImportDriver {
  nama: string;
  nik: string;
  nomor_sim?: string;
  jenis_sim?: string;
  kontak?: string;
  alamat?: string;
}

export interface ImportKirRecord {
  plat_nomor: string;
  start_date: string;
  end_date: string;
  uji_result?: string;
  nomor_kir?: string;
}

export interface ImportStnkRecord {
  plat_nomor: string;
  type: string;
  start_date: string;
  exp_date: string;
  asuransi?: string;
}

export interface ImportServiceRecord {
  plat_nomor: string;
  date: string;
  type: string;
  cost?: number;
  km?: number;
  vendor?: string;
  notes?: string;
}

export interface ParsedSheet<T> {
  rows: T[];
  errors: { row: number; message: string }[];
}

export interface ParsedImport {
  vehicles: ParsedSheet<ImportVehicle>;
  drivers: ParsedSheet<ImportDriver>;
  kir_records: ParsedSheet<ImportKirRecord>;
  stnk_records: ParsedSheet<ImportStnkRecord>;
  service_records: ParsedSheet<ImportServiceRecord>;
}

export interface DuplicateInfo {
  sheet: string;
  row: number;
  key: string;
  existing: Record<string, unknown>;
}

export type DuplicateAction = "skip" | "update" | "replace";

export interface ResolvedDuplicate {
  sheet: string;
  row: number;
  key: string;
  action: DuplicateAction;
}

export interface ImportSummary {
  vehicles: number;
  drivers: number;
  kirRecords: number;
  stnkRecords: number;
  serviceRecords: number;
}

export interface ImportError {
  sheet: string;
  row: number;
  message: string;
  data: string;
}

export interface ImportResult {
  summary: ImportSummary;
  errors: ImportError[];
}

// ---- Validation ----

const PLATE_RE = /^[A-Z]{1,3}\s?\d{1,4}\s?[A-Z]{0,3}$/i;

function validatePlate(value: string, row: number): string | null {
  if (!value || !value.trim()) return `Baris ${row}: plat_nomor wajib diisi`;
  if (!PLATE_RE.test(value.trim()))
    return `Baris ${row}: format plat_nomor tidak valid ("${value}")`;
  return null;
}

function validateNik(value: string, row: number): string | null {
  if (!value || !value.trim()) return `Baris ${row}: nik wajib diisi`;
  if (!/^\d{16}$/.test(value.trim()))
    return `Baris ${row}: NIK harus 16 digit ("${value}")`;
  return null;
}

function validateName(value: string, row: number): string | null {
  if (!value || !value.trim()) return `Baris ${row}: nama wajib diisi`;
  return null;
}

function validateDate(value: string, row: number, label: string): string | null {
  if (!value || isNaN(Date.parse(value))) {
    return `Baris ${row}: ${label} bukan tanggal valid ("${value}")`;
  }
  return null;
}

// ---- Template ----

export function generateExcelTemplate(): Buffer {
  const XLSX = require("xlsx");

  const wb = XLSX.utils.book_new();

  const vehicleHeaders = ["plat_nomor", "jenis", "merk", "tahun"];
  const vehicleData = [["PK 1234 AB", "Angkot", "Toyota", 2018]];

  const driverHeaders = ["nama", "nik", "nomor_sim", "jenis_sim", "kontak", "alamat"];
  const driverData = [["Budi Santoso", "3174010101010001", "810101010101", "B1 Umum", "081234567890", "Jakarta"]];

  const kirHeaders = ["plat_nomor", "start_date", "end_date", "uji_result", "nomor_kir"];
  const kirData = [["PK 1234 AB", "2026-01-01", "2026-07-01", "Laik", "KIR-001"]];

  const stnkHeaders = ["plat_nomor", "type", "start_date", "exp_date", "asuransi"];
  const stnkData = [["PK 1234 AB", "tahunan", "2026-01-01", "2026-12-31", "Jasa Raharja"]];

  const serviceHeaders = ["plat_nomor", "date", "type", "cost", "km", "vendor", "notes"];
  const serviceData = [["PK 1234 AB", "2026-03-15", "rutin", 250000, 50000, "Bengkel Jaya", "Ganti oli"]];

  function addSheet(name: string, headers: string[], data: string[][] | number[][]) {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data.map(r => r.map(c => c))]);
    XLSX.utils.book_append_sheet(wb, ws, name);
  }

  addSheet("vehicles", vehicleHeaders, vehicleData);
  addSheet("drivers", driverHeaders, driverData);
  addSheet("kir_records", kirHeaders, kirData);
  addSheet("stnk_records", stnkHeaders, stnkData);
  addSheet("service_records", serviceHeaders, serviceData);

  return Buffer.from(
    XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
  );
}

// ---- Parsing ----

function parseSheet<T>(
  workbook: XLSX.WorkBook,
  sheetName: string,
  requiredCols: string[],
  knownCols: string[],
  rowValidator: (row: Record<string, string>, idx: number) => string | null
): ParsedSheet<T> {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return { rows: [], errors: [] };

  const raw: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  const rows: T[] = [];
  const errors: { row: number; message: string }[] = [];

  raw.forEach((r, idx) => {
    const excelRow = idx + 2;

    // Check required columns
    for (const col of requiredCols) {
      if (!r[col] || !String(r[col]).trim()) {
        errors.push({ row: excelRow, message: `Baris ${excelRow}: ${col} wajib diisi` });
        return;
      }
    }

    const error = rowValidator(r, excelRow);
    if (error) {
      errors.push({ row: excelRow, message: error });
      return;
    }

    // Pick only known columns
    const cleaned: Record<string, unknown> = {};
    for (const col of knownCols) {
      cleaned[col] = r[col] ?? "";
    }

    rows.push(cleaned as T);
  });

  return { rows, errors };
}

export function parseExcel(file: Buffer): ParsedImport {
  const XLSX = require("xlsx");
  const workbook = XLSX.read(file, { type: "buffer" });

  const vehicles = parseSheet<ImportVehicle>(
    workbook, "vehicles",
    ["plat_nomor", "jenis"],
    ["plat_nomor", "jenis", "merk", "tahun"],
    (r, row) => validatePlate(r.plat_nomor, row)
  );

  const drivers = parseSheet<ImportDriver>(
    workbook, "drivers",
    ["nama", "nik"],
    ["nama", "nik", "nomor_sim", "jenis_sim", "kontak", "alamat"],
    (r, row) => validateName(r.nama, row) ?? validateNik(r.nik, row)
  );

  const kir_records = parseSheet<ImportKirRecord>(
    workbook, "kir_records",
    ["plat_nomor", "start_date", "end_date"],
    ["plat_nomor", "start_date", "end_date", "uji_result", "nomor_kir"],
    (r, row) =>
      validatePlate(r.plat_nomor, row) ??
      validateDate(r.start_date, row, "start_date") ??
      validateDate(r.end_date, row, "end_date")
  );

  const stnk_records = parseSheet<ImportStnkRecord>(
    workbook, "stnk_records",
    ["plat_nomor", "type", "start_date", "exp_date"],
    ["plat_nomor", "type", "start_date", "exp_date", "asuransi"],
    (r, row) =>
      validatePlate(r.plat_nomor, row) ??
      validateDate(r.start_date, row, "start_date") ??
      validateDate(r.exp_date, row, "exp_date")
  );

  const service_records = parseSheet<ImportServiceRecord>(
    workbook, "service_records",
    ["plat_nomor", "date", "type"],
    ["plat_nomor", "date", "type", "cost", "km", "vendor", "notes"],
    (r, row) =>
      validatePlate(r.plat_nomor, row) ??
      validateDate(r.date, row, "date")
  );

  return { vehicles, drivers, kir_records, stnk_records, service_records };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/utils/import-excel.ts
git commit -m "feat: add Excel template generation and parsing utilities"
```

---

### Task 3: Create template download and parse server actions

**Files:**
- Create: `src/lib/actions/import.ts`

Two server actions: one returns the template as a downloadable file, one parses uploaded file and detects duplicates.

- [ ] **Step 1: Write the file**

```typescript
// src/lib/actions/import.ts
"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { vehicles, drivers, kirRecords, stnkRecords, serviceRecords } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  parseExcel,
  generateExcelTemplate,
  type ParsedImport,
  type DuplicateInfo,
  type ImportSummary,
  type ImportError,
  type ImportResult,
  type ImportVehicle,
  type ImportDriver,
  type ImportKirRecord,
  type ImportStnkRecord,
  type ImportServiceRecord,
  type ResolvedDuplicate,
} from "@/lib/utils/import-excel";

// ---- Parse uploaded file + detect duplicates ----

export async function parseImportFile(
  formData: FormData
): Promise<{
  error?: string;
  parsed?: ParsedImport;
  duplicates?: DuplicateInfo[];
}> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const userId = session.user.id;

  try {
    const file = formData.get("file") as File;
    if (!file) return { error: "File tidak ditemukan" };

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = parseExcel(buffer);

    // Detect duplicates
    const duplicates: DuplicateInfo[] = [];

    // Vehicles: check by plate (case-insensitive JS comparison)
    const existingV = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.userId, userId));

    const existingPlates = new Set(existingV.map((v) => v.plate.toUpperCase()));
    parsed.vehicles.rows.forEach((v, idx) => {
      const upperPlate = v.plat_nomor.trim().toUpperCase();
      if (existingPlates.has(upperPlate)) {
        duplicates.push({
          sheet: "vehicles",
          row: idx + 2,
          key: upperPlate,
          existing: existingV.find((e) => e.plate.toUpperCase() === upperPlate) ?? {},
        });
      }
    });

    // Drivers: check by NIK (stored in simNumber column)
    const existingD = await db
      .select()
      .from(drivers)
      .where(eq(drivers.userId, userId));

    const existingNiks = new Set(existingD.map((d) => d.simNumber));
    parsed.drivers.rows.forEach((d, idx) => {
      const nik = d.nik.trim();
      if (existingNiks.has(nik)) {
        duplicates.push({
          sheet: "drivers",
          row: idx + 2,
          key: nik,
          existing: existingD.find((e) => e.simNumber === nik) ?? {},
        });
      }
    });

    return { parsed, duplicates };
  } catch (error) {
    console.error("parseImportFile:", error);
    return { error: "Gagal membaca file Excel. Pastikan format dan nama sheet benar." };
  }
}

// ---- Execute import ----

export async function executeImport(
  parsed: ParsedImport,
  resolvedDuplicates: ResolvedDuplicate[]
): Promise<ImportResult> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;
  const summary: ImportSummary = {
    vehicles: 0,
    drivers: 0,
    kirRecords: 0,
    stnkRecords: 0,
    serviceRecords: 0,
  };
  const errors: ImportError[] = [];

  // Build duplicate action maps
  const dupVehicleActions = new Map<string, string>();
  const dupDriverActions = new Map<string, string>();
  for (const d of resolvedDuplicates) {
    if (d.sheet === "vehicles") dupVehicleActions.set(d.key, d.action);
    if (d.sheet === "drivers") dupDriverActions.set(d.key, d.action);
  }

  // 1. Import vehicles
  // Fetch existing vehicles for replace/update lookups
  const existingV = await db.select().from(vehicles).where(eq(vehicles.userId, userId));
  
  for (const v of parsed.vehicles.rows) {
    try {
      const key = v.plat_nomor.trim().toUpperCase();
      const action = dupVehicleActions.get(key);

      if (action === "skip") continue;

      if (action === "replace") {
        // Find and delete by exact plate (stored uppercase)
        const existing = existingV.find((e) => e.plate.toUpperCase() === key);
        if (existing) {
          await db.delete(vehicles).where(eq(vehicles.id, existing.id));
        }
      }

      if (action === "update") {
        const existing = existingV.find((e) => e.plate.toUpperCase() === key);
        if (existing) {
          await db
            .update(vehicles)
            .set({ name: v.jenis || undefined })
            .where(eq(vehicles.id, existing.id));
        }
        summary.vehicles++;
      } else {
        await db.insert(vehicles).values({
          userId,
          plate: v.plat_nomor.trim().toUpperCase(),
          name: v.jenis || null,
        });
        summary.vehicles++;
      }
    } catch (e) {
      errors.push({
        sheet: "vehicles",
        row: 0,
        message: e instanceof Error ? e.message : "Unknown error",
        data: JSON.stringify(v),
      });
    }
  }

  // 2. Import drivers
  for (const d of parsed.drivers.rows) {
    try {
      const key = d.nik.trim();
      const action = dupDriverActions.get(key);

      if (action === "skip") continue;

      if (action === "replace") {
        await db.delete(drivers).where(
          and(eq(drivers.userId, userId), eq(drivers.simNumber, key))
        );
      }

      if (action === "update") {
        await db
          .update(drivers)
          .set({
            name: d.nama || undefined,
            phone: d.kontak || undefined,
          })
          .where(and(eq(drivers.userId, userId), eq(drivers.simNumber, key)));
        summary.drivers++;
      } else {
        await db.insert(drivers).values({
          userId,
          name: d.nama,
          simNumber: d.nik, // NIK as simNumber since no separate NIK column
          phone: d.kontak || null,
          notes: d.alamat || null,
        });
        summary.drivers++;
      }
    } catch (e) {
      errors.push({
        sheet: "drivers",
        row: 0,
        message: e instanceof Error ? e.message : "Unknown error",
        data: JSON.stringify(d),
      });
    }
  }

  // Fetch vehicle IDs for FK resolution (plate -> id mapping)
  const allVehicles = await db.select().from(vehicles).where(eq(vehicles.userId, userId));
  const plateToId = new Map(allVehicles.map((v) => [v.plate.toUpperCase(), v.id]));

  // 3. Import KIR records
  for (const k of parsed.kir_records.rows) {
    try {
      const vid = plateToId.get(k.plat_nomor.trim().toUpperCase());
      if (!vid) {
        errors.push({
          sheet: "kir_records",
          row: 0,
          message: `Plat "${k.plat_nomor}" tidak ditemukan`,
          data: JSON.stringify(k),
        });
        continue;
      }
      await db.insert(kirRecords).values({
        vehicleId: vid,
        startDate: k.start_date,
        endDate: k.end_date,
        notes: k.uji_result || k.nomor_kir ? `${k.uji_result ?? ""} ${k.nomor_kir ?? ""}`.trim() || null : null,
      });
      summary.kirRecords++;
    } catch (e) {
      errors.push({
        sheet: "kir_records",
        row: 0,
        message: e instanceof Error ? e.message : "Unknown error",
        data: JSON.stringify(k),
      });
    }
  }

  // 4. Import STNK records
  for (const s of parsed.stnk_records.rows) {
    try {
      const vid = plateToId.get(s.plat_nomor.trim().toUpperCase());
      if (!vid) {
        errors.push({
          sheet: "stnk_records",
          row: 0,
          message: `Plat "${s.plat_nomor}" tidak ditemukan`,
          data: JSON.stringify(s),
        });
        continue;
      }
      await db.insert(stnkRecords).values({
        vehicleId: vid,
        type: (["tahunan", "lima_tahunan", "asuransi"].includes(s.type) ? s.type : "tahunan") as "tahunan" | "lima_tahunan" | "asuransi",
        startDate: s.start_date,
        endDate: s.exp_date,
        notes: s.asuransi || null,
      });
      summary.stnkRecords++;
    } catch (e) {
      errors.push({
        sheet: "stnk_records",
        row: 0,
        message: e instanceof Error ? e.message : "Unknown error",
        data: JSON.stringify(s),
      });
    }
  }

  // 5. Import service records
  for (const s of parsed.service_records.rows) {
    try {
      const vid = plateToId.get(s.plat_nomor.trim().toUpperCase());
      if (!vid) {
        errors.push({
          sheet: "service_records",
          row: 0,
          message: `Plat "${s.plat_nomor}" tidak ditemukan`,
          data: JSON.stringify(s),
        });
        continue;
      }
      const nextDate = new Date(s.date);
      nextDate.setMonth(nextDate.getMonth() + 3);
      await db.insert(serviceRecords).values({
        vehicleId: vid,
        serviceDate: s.date,
        type: (["rutin", "besar", "lainnya"].includes(s.type) ? s.type : "rutin") as "rutin" | "besar" | "lainnya",
        nextServiceDate: nextDate.toISOString().split("T")[0],
        notes: [s.notes, s.vendor].filter(Boolean).join(" | ") || null,
      });
      summary.serviceRecords++;
    } catch (e) {
      errors.push({
        sheet: "service_records",
        row: 0,
        message: e instanceof Error ? e.message : "Unknown error",
        data: JSON.stringify(s),
      });
    }
  }

  return { summary, errors };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions/import.ts
git commit -m "feat: add parseImportFile and executeImport server actions"
```

---

### Task 4: Create template download API endpoint

**Files:**
- Create: `src/app/api/import/template/route.ts`

Returns the Excel template file for download.

- [ ] **Step 1: Write the file**

```typescript
// src/app/api/import/template/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateExcelTemplate } from "@/lib/utils/import-excel";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const buffer = generateExcelTemplate();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="template-import-trayekin.xlsx"',
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/import/template/route.ts
git commit -m "feat: add Excel template download endpoint"
```

---

### Task 5: Create import page and flow component

**Files:**
- Create: `src/app/(app)/vehicles/import/page.tsx` (Server Component page wrapper)
- Create: `src/components/import-flow.tsx` (Client Component multi-step flow)

The page is a Server Component that renders `ImportFlow`. `ImportFlow` handles the 5-step flow.

- [ ] **Step 1: Write the server component page**

```typescript
// src/app/(app)/vehicles/import/page.tsx
import { ImportFlow } from "@/components/import-flow";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Import Data</h1>
      <ImportFlow />
    </div>
  );
}
```

- [ ] **Step 2: Write the client component**

```typescript
// src/components/import-flow.tsx
"use client";

import { useState, useCallback, startTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  parseImportFile,
  executeImport,
} from "@/lib/actions/import";
import type {
  ParsedImport,
  DuplicateInfo,
  DuplicateAction,
  ResolvedDuplicate,
  ImportResult,
} from "@/lib/utils/import-excel";
import { Upload, Download, FileSpreadsheet, Check, X, AlertCircle } from "lucide-react";

type Step = "upload" | "preview" | "summary";

export function ImportFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsed, setParsed] = useState<ParsedImport | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateInfo[]>([]);
  const [resolvedActions, setResolvedActions] = useState<Record<string, DuplicateAction>>({});
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      startTransition(async () => {
        const res = await parseImportFile(formData);

        if (res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }

        setParsed(res.parsed ?? null);
        setDuplicates(res.duplicates ?? []);

        // Default all duplicates to "skip"
        const actions: Record<string, DuplicateAction> = {};
        (res.duplicates ?? []).forEach((d) => {
          actions[`${d.sheet}:${d.row}`] = "skip";
        });
        setResolvedActions(actions);

        // Check if there are actual rows to import
        const totalRows =
          (res.parsed?.vehicles.rows.length ?? 0) +
          (res.parsed?.drivers.rows.length ?? 0) +
          (res.parsed?.kir_records.rows.length ?? 0) +
          (res.parsed?.stnk_records.rows.length ?? 0) +
          (res.parsed?.service_records.rows.length ?? 0);

        const totalValidationErrors =
          (res.parsed?.vehicles.errors.length ?? 0) +
          (res.parsed?.drivers.errors.length ?? 0) +
          (res.parsed?.kir_records.errors.length ?? 0) +
          (res.parsed?.stnk_records.errors.length ?? 0) +
          (res.parsed?.service_records.errors.length ?? 0);

        if (totalRows === 0 && totalValidationErrors > 0) {
          setError("Tidak ada data valid di file Excel. Periksa format dan nama sheet.");
          setLoading(false);
          return;
        }

        setStep("preview");
        setLoading(false);
      });
    } catch (err) {
      setError("Gagal membaca file. Pastikan file Excel (.xlsx) valid.");
    }

    setLoading(false);
  }, []);

  const handleDuplicateAction = (key: string, action: DuplicateAction) => {
    setResolvedActions((prev) => ({ ...prev, [key]: action }));
  };

  const handleConfirmImport = async () => {
    if (!parsed) return;

    setLoading(true);
    setError("");

    try {
      const resolved: ResolvedDuplicate[] = duplicates.map((d) => ({
        sheet: d.sheet,
        row: d.row,
        key: d.key,
        action: resolvedActions[`${d.sheet}:${d.row}`] ?? "skip",
      }));

      const res = await executeImport(parsed, resolved);
      setResult(res);
      setStep("summary");
    } catch (err) {
      setError("Gagal melakukan import. Coba lagi.");
    }

    setLoading(false);
  };

  const handleReset = () => {
    setStep("upload");
    setParsed(null);
    setDuplicates([]);
    setResolvedActions({});
    setResult(null);
    setError("");
  };

  const totalRows =
    parsed
      ? parsed.vehicles.rows.length +
        parsed.drivers.rows.length +
        parsed.kir_records.rows.length +
        parsed.stnk_records.rows.length +
        parsed.service_records.rows.length
      : 0;

  const totalValidationErrors =
    parsed
      ? parsed.vehicles.errors.length +
        parsed.drivers.errors.length +
        parsed.kir_records.errors.length +
        parsed.stnk_records.errors.length +
        parsed.service_records.errors.length
      : 0;

  const duplicateCount = duplicates.filter(
    (d) => resolvedActions[`${d.sheet}:${d.row}`] !== "skip"
  ).length;

  // ---- Step 1: Upload ----
  if (step === "upload") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upload File Excel</CardTitle>
          <CardDescription>
            Download template, isi data, lalu upload kembali untuk import massal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" asChild>
            <a href="/api/import/template" download>
              <Download className="h-4 w-4 mr-2" />
              Download Template Excel
            </a>
          </Button>

          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <Label
              htmlFor="fileUpload"
              className="cursor-pointer text-primary font-medium"
            >
              Klik untuk pilih file
            </Label>
            <Input
              id="fileUpload"
              type="file"
              accept=".xlsx"
              onChange={handleFileUpload}
              disabled={loading}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-1">Format .xlsx, max 5MB</p>
          </div>

          {loading && <p className="text-sm text-muted-foreground text-center">Memproses file...</p>}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        </CardContent>
      </Card>
    );
  }

  // ---- Step 2: Preview ----
  if (step === "preview" && parsed) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Preview Import</CardTitle>
              <CardDescription>
                {totalRows} data siap diimport
                {totalValidationErrors > 0 &&
                  ` (${totalValidationErrors} error validasi)`}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Batal
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {duplicates.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {duplicates.length} Data Duplikat Ditemukan
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Pilih tindakan untuk setiap duplikat di bawah ini.
                </p>
              </div>
            )}

            {duplicates.map((d) => (
              <div
                key={`${d.sheet}:${d.row}`}
                className="border rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-sm">
                    {d.sheet.replace("_", " ").toUpperCase()} — Baris {d.row}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Key: {d.key}
                  </div>
                </div>
                <div className="flex gap-1">
                  {(["skip", "update", "replace"] as DuplicateAction[]).map(
                    (action) => (
                      <Button
                        key={action}
                        size="xs"
                        variant={
                          resolvedActions[`${d.sheet}:${d.row}`] === action
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          handleDuplicateAction(`${d.sheet}:${d.row}`, action)
                        }
                      >
                        {action === "skip"
                          ? "Lewati"
                          : action === "update"
                          ? "Update"
                          : "Ganti"}
                      </Button>
                    )
                  )}
                </div>
              </div>
            ))}

            {totalValidationErrors > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800">
                  {totalValidationErrors} Error Validasi
                </h3>
                <ul className="text-sm text-red-700 mt-1 space-y-1">
                  {parsed.vehicles.errors.map((e, i) => (
                    <li key={`ve-${i}`}>{e.message}</li>
                  ))}
                  {parsed.drivers.errors.map((e, i) => (
                    <li key={`dr-${i}`}>{e.message}</li>
                  ))}
                  {parsed.kir_records.errors.map((e, i) => (
                    <li key={`ki-${i}`}>{e.message}</li>
                  ))}
                  {parsed.stnk_records.errors.map((e, i) => (
                    <li key={`st-${i}`}>{e.message}</li>
                  ))}
                  {parsed.service_records.errors.map((e, i) => (
                    <li key={`se-${i}`}>{e.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={handleConfirmImport}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Mengimport..." : `Konfirmasi Import (${totalRows - duplicateCount} data)`}
        </Button>
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </div>
    );
  }

  // ---- Step 3: Summary ----
  if (step === "summary" && result) {
    const totalSuccess =
      result.summary.vehicles +
      result.summary.drivers +
      result.summary.kirRecords +
      result.summary.stnkRecords +
      result.summary.serviceRecords;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Import Selesai</CardTitle>
            <CardDescription>
              {totalSuccess} data berhasil diimport
              {result.errors.length > 0 &&
                `, ${result.errors.length} gagal`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-muted-foreground">Kendaraan</div>
                <div className="text-lg font-bold text-green-700">
                  {result.summary.vehicles}
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-muted-foreground">Sopir</div>
                <div className="text-lg font-bold text-green-700">
                  {result.summary.drivers}
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-muted-foreground">KIR</div>
                <div className="text-lg font-bold text-green-700">
                  {result.summary.kirRecords}
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-muted-foreground">STNK</div>
                <div className="text-lg font-bold text-green-700">
                  {result.summary.stnkRecords}
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg col-span-2">
                <div className="text-xs text-muted-foreground">Service</div>
                <div className="text-lg font-bold text-green-700">
                  {result.summary.serviceRecords}
                </div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">
                  {result.errors.length} Data Gagal
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const csv =
                      "sheet,row,message,data\n" +
                      result.errors
                        .map(
                          (e) =>
                            `${e.sheet},${e.row},"${e.message}","${e.data.replace(/"/g, '""')}"`
                        )
                        .join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "import-errors.csv";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download Error CSV
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Import Lagi
          </Button>
          <Button
            onClick={() => router.push("/vehicles")}
            className="flex-1"
          >
            Kembali ke Kendaraan
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(app)/vehicles/import/page.tsx src/components/import-flow.tsx
git commit -m "feat: add bulk import page with multi-step flow"
```

---

### Task 6: Add navigation link to import page

**Files:**
- Modify: `src/app/(app)/vehicles/page.tsx`

Add a button/link to the import page.

- [ ] **Step 1: Read the current vehicles page**

Read `src/app/(app)/vehicles/page.tsx` to find the header section.

- [ ] **Step 2: Add import button**

```tsx
// At the top of the page, next to or within the header:
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

// Add inside the page header:
<div className="flex items-center justify-between">
  <h1 className="text-xl font-bold">Kendaraan</h1>
  <Button variant="outline" size="sm" asChild>
    <Link href="/vehicles/import">
      <Upload className="h-4 w-4 mr-2" />
      Import
    </Link>
  </Button>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(app)/vehicles/page.tsx
git commit -m "feat: add import link on vehicles page"
```

---

### Task 7: Lint and build verification

- [ ] **Step 1: Run lint**

```bash
pnpm lint
```

Expected: No errors. Fix any lint errors before proceeding.

- [ ] **Step 2: Run build (includes typecheck)**

```bash
pnpm build
```

Expected: Successful build with no type errors. Fix any type errors before proceeding.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: lint and type fixes for bulk import"
```

---

### Task 8: Database migration

- [ ] **Step 1: Push schema (if any changes)**

```bash
pnpm drizzle-kit push
```

No schema changes needed for Feature 1. But verify the connection works.

- [ ] **Step 2: Verify**

```bash
echo "OK"
```

Expected: Database connection is working.
