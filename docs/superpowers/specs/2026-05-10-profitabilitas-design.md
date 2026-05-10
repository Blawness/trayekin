# Feature 2: Laporan Profitabilitas per Kendaraan

**Date:** 2026-05-10
**Status:** Approved

---

## Overview

Menambahkan dashboard profitabilitas yang menampilkan performa finansial per kendaraan — revenue berbasis km dari Transjakarta, total biaya (service, parts, KIR, STNK, BBM), net profit, dan margin ratio dalam satu periode waktu.

---

## Revenue Model: Transjakarta per KM

Operator dibayar oleh Transjakarta berdasarkan **jarak tempuh**. Maka sistem harus:

1. Menyimpan konfigurasi **biaya per KM** (bisa diubah admin)
2. Mencatat `km` di DailyLedger setiap hari
3. Menghitung otomatis `revenue = km × rate_per_km`

---

## Schema Changes

### Table: `app_settings` (new)
```sql
CREATE TABLE app_settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  type TEXT DEFAULT 'string', -- string, number, boolean
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Initial rows:
| key | value | type |
|-----|-------|------|
| `rate_per_km` | `4500` | number |
| `fuel_price_per_liter` | `10000` | number |
| `fuel_consumption_km_per_l` | `10` | number |

### Table: `daily_ledger` (add column)
```sql
ALTER TABLE daily_ledger ADD COLUMN km INTEGER;
```
- `km`: jarak tempuh hari itu (opsional, bisa null jika user belum input)

---

## UI: Settings Page

### Page: `/settings` (new)

```
┌──────────────────────────────────────────┐
│  Settings                          Save  │
├──────────────────────────────────────────┤
│                                          │
│  Biaya Transjakarta per KM              │
│  Rp [4.500]                              │
│                                          │
│  Harga BBM per Liter                    │
│  Rp [10.000]                             │
│                                          │
│  Konsumsi BBM (km/liter)                │
│  [10]                                    │
│                                          │
└──────────────────────────────────────────┘
```

Disimpan via server action `updateAppSettings`.

---

## UI: Daily Ledger (updated)

### Existing form pada halaman vehicle detail — tambah field `km`:

```
┌─────────────────────────────────┐
│ Setoran Harian - B 1234 XYZ    │
│                                 │
│ Tanggal: [12/05/2026]          │
│ KM Tempuh: [120]               │  ← NEW
│ Rate: Rp 4.500/km              │  ← dari settings
│ Revenue: Rp 540.000            │  ← auto = km × rate
│ Biaya Lain: [50.000]           │
│ ─────────────────────          │
│ Total Bersih: Rp 490.000       │  ← revenue − biaya
└─────────────────────────────────┘
```

---

## UI: Laporan Profitabilitas

### Page: `/reports` (tab baru atau section baru)

**Time Period Selector:**
- Preset: 30h, 60h, 90h
- Custom range: date picker

**Summary Cards (fleet-wide):**
| Card | Formula |
|------|---------|
| Total Revenue | Σ(km × rate) |
| Total Costs | service + parts + KIR(prorata) + STNK(prorata) + BBM(est) |
| Fleet Margin % | (Revenue − Costs) / Revenue × 100 |

**Per-Vehicle Table:**

| Kolom | Formula |
|-------|---------|
| Plat Nomor | vehicles.plat_nomor |
| Total KM | Σ(daily_ledger.km) |
| Revenue | Σ(km × rate_per_km) |
| Biaya Service | Σ(service_records.cost) |
| Biaya Parts | Σ(part_replacements.cost) |
| Biaya KIR (prorata) | Σ(KIR cost / 180 × days_in_period) |
| Biaya STNK (prorata) | Σ(STNK cost / 365 × days_in_period) |
| Estimasi BBM | (total_km / fuel_consumption) × fuel_price |
| Total Biaya | sum of all costs |
| Net Profit | Revenue − Total Biaya |
| Margin % | Net / Revenue × 100 |

**Sortable columns, filter: hanya vehicles dengan activity dalam periode.**

**Revenue vs Cost Trend Chart (opsional — bisa ditambahkan nanti):**
- Bar chart harian revenue vs cost
- Atau mini sparkline per vehicle

---

## Technical Approach

### Server Action: `getProfitabilityReport(periodStart, periodEnd, ratePerKm?, fuelPrice?, fuelConsumption?)`

1. Fetch semua vehicles user
2. Fetch daily_ledger dalam periode (per vehicle)
3. Fetch service_records, part_replacements, kir_records, stnk_records dalam periode
4. Fetch app_settings untuk rate default
5. Calculate metrics di memory (TypeScript)
6. Return array `ProfitabilityRow[]`

### Key: Manual batch queries (hindari Drizzle relational queries untuk Neon compatibility)

---

## Acceptance Criteria

- [ ] Settings page: user bisa set biaya per KM, harga BBM, konsumsi BBM
- [ ] DailyLedger form menampilkan field KM dan auto-calculate revenue
- [ ] Revenue = km × rate_per_km dihitung otomatis
- [ ] Laporan profitabilitas menampilkan semua metrik per kendaraan
- [ ] Sorter dan filter berfungsi
- [ ] 30h/60h/90h period selector berfungsi
- [ ] Rate change berlaku untuk kalkulasi baru (tidak mengubah data historis)