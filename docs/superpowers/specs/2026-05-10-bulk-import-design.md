# Feature 1: Bulk Import Data

**Date:** 2026-05-10
**Status:** Approved

---

## Overview

Fitur bulk import memungkinkan operator menginput data dalam jumlah besar melalui file Excel (.xlsx) dengan multiple sheets, mengurangi beban input manual satu per satu.

---

## File Format

### Single Excel File (.xlsx) dengan 5 Sheets:

#### Sheet: `vehicles`
| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `plat_nomor` | string | Yes | Nomor polisi (PK XXXX XX) |
| `jenis` | string | Yes | Jenis kendaraan (angkot, dll) |
| `merk` | string | No | Merk kendaraan |
| `tahun` | number | No | Tahun pembuatan |
| `nomor_rangka` | string | No | Nomor rangka |
| `nomor_mesin` | string | No | Nomor mesin |

#### Sheet: `drivers`
| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `nama` | string | Yes | Nama lengkap |
| `nik` | string | Yes | NIK (NIK KTP) |
| `nomor_sim` | string | Yes | Nomor SIM |
| `jenis_sim` | string | No | Jenis SIM (B1, B2, dll) |
| `kontak` | string | No | Nomor HP |
| `alamat` | string | No | Alamat |

#### Sheet: `kir_records`
| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `plat_nomor` | string | Yes | FK ke vehicles.plat_nomor |
| `start_date` | date | Yes | Tanggal mulai uji |
| `end_date` | date | Yes | Tanggal expire |
| `uji_result` | string | No | Hasil uji (laik/tidak laik) |
| `nomor_kir` | string | No | Nomor KIR |

#### Sheet: `stnk_records`
| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `plat_nomor` | string | Yes | FK ke vehicles.plat_nomor |
| `type` | enum | Yes | 'tahunan' atau '5_tahun' |
| `start_date` | date | Yes | Tanggal mulai |
| `exp_date` | date | Yes | Tanggal expire |
| `nomor_polisi` | string | No | Nomor polisi (ulang) |
| `asuransi` | string | No | Nama asuransi |
| `nomor_asuransi` | string | No | Nomor polis |

#### Sheet: `service_records`
| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `plat_nomor` | string | Yes | FK ke vehicles.plat_nomor |
| `date` | date | Yes | Tanggal service |
| `type` | string | Yes | Jenis service |
| `cost` | number | No | Biaya (IDR) |
| `km` | number | No | Kilometer saat service |
| `vendor` | string | No | Nama bengkel/vendor |
| `notes` | string | No | Catatan |

---

## UI/UX

### Page: `/vehicles/import`

#### Step 1: Upload
- Drag & drop atau klik untuk upload file .xlsx
- Validasi: hanya accept .xlsx, max 5MB
- Error handling: tampilkan pesan jika file invalid

#### Step 2: Parse & Preview
- Parse semua sheets, tampilkan preview table per sheet
- Tampilkan jumlah row per sheet
- Highlight row yang terdetek sebagai duplikat (plat_nomor atau nik sudah ada)

#### Step 3: Resolve Duplicates
- Untuk setiap duplikat, tampilkan pilihan:
  - **Skip** — lewati, jangan import
  - **Update** — update field yang ada di file, keep existing values untuk field kosong
  - **Replace** — replace seluruh record dengan data baru
- Default: Skip
- User bisa bulk select action untuk semua duplikat

#### Step 4: Confirm & Import
- Tombol "Konfirmasi Import"
- Proses async dengan progress indicator
- Background: insert/update data ke database via server action

#### Step 5: Summary
- Tampilkan hasil: X vehicles, Y drivers, Z records imported
- Jika ada error: tombol "Download Error CSV" untuk list detail error
- Link "Kembali ke Vehicles" dan "Import Lagi"

---

## Error Handling

### Validation Rules
- plat_nomor (vehicles): required, format "PK XXXX XX"
- nik (drivers): required, 16 digit
- tanggal: valid date format
- cost/km: must be positive number

### Duplicate Detection
- **vehicles**: by plat_nomor
- **drivers**: by nik
- **kir_records**: by plat_nomor + start_date (composite key)
- **stnk_records**: by plat_nomor + type + exp_date
- **service_records**: by plat_nomor + date + type

### Error Summary (Post-Import)
- Total succeeded vs failed per entity type
- Downloadable CSV containing: row_number, sheet_name, error_message, raw_data

---

## Technical Approach

### Client
- `xlsx` library (via CDN atau npm) untuk parse Excel
- React state untuk multi-step form
- Server action untuk proses import

### Server Action: `importBulkData`
1. Accept: File object
2. Parse using `xlsx` library
3. Validate each sheet
4. Detect duplicates via DB queries
5. Return preview data with duplicate flags
6. On confirm: batch insert/update with transaction
7. Return summary + errors

### API Design
```
POST /api/import/parse (multipart/form-data)
→ { sheets: { vehicles: [], drivers: [], ... }, duplicates: {...}, errors: [...] }

POST /api/import/execute
← { success: { vehicles: 10, drivers: 5, ... }, errors: [...] }
```

---

## Acceptance Criteria

- [ ] User bisa upload file .xlsx dan lihat preview semua sheet
- [ ] Row duplikat ditandai dan user bisa pilih action per record
- [ ] Import memproses semua 5 entity types dengan benar
- [ ] Error list bisa di-download sebagai CSV
- [ ] Progress indicator selama proses import
- [ ] Importatomic (semua atau tidak ada — pakai transaction)