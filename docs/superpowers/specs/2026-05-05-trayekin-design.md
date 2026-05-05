# Trayekin — Design Spec

> Aplikasi pengingat KIR & servis kendaraan operasional (angkot) di Indonesia.

## Ringkasan

Trayekin membantu pemilik kendaraan operasional mengelola KIR dan servis rutin dengan reminder otomatis. Fokus: super simpel, cepat dipakai, andal.

**Scope awal:** Tracking KIR, tracking servis, reminder otomatis.
**Future:** Histori maintenance, integrasi bengkel.

## Keputusan Desain

| Aspek | Keputusan | Alasan |
|---|---|---|
| Model user | Multi-vehicle per user | Fleksibel untuk pemilik 1-5+ kendaraan |
| Reminder | In-app + Push notification (Web Push API) | Notifikasi sampai ke OS walau app gak dibuka |
| Auth | Email + Password (Auth.js v5 Credentials) | Simpel, gak perlu provider eksternal |
| Data model | Standard (plate, name, dates, notes, photo) | Esensial tanpa over-engineer |
| Interval KIR | 6 bulan | Standar Indonesia |
| Interval servis | 3 bulan | Standar Indonesia |
| Notifikasi timing | H-30, H-14, H-7, H-3, H-1 | Cukup untuk reminder tanpa spam |
| Arsitektur | Monolith Next.js | Satu app, deploy 1 command, simpel |

## Tech Stack

- **Frontend & Backend:** Next.js 16 (App Router) + TypeScript
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Drizzle ORM
- **UI:** shadcn/ui + Tailwind CSS
- **Auth:** Auth.js v5 (Credentials provider)
- **Push:** Web Push API (`web-push` npm)
- **Cron:** Vercel Cron Jobs
- **Hosting:** Vercel (Hobby tier)

## Struktur Proyek

```
trayekin/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (html, body, providers)
│   ├── page.tsx            # Dashboard (landing after login)
│   ├── login/
│   │   └── page.tsx        # Login form
│   ├── register/
│   │   └── page.tsx        # Register form
│   ├── vehicles/
│   │   ├── page.tsx        # List kendaraan
│   │   ├── new/page.tsx    # Tambah kendaraan
│   │   └── [id]/
│   │       └── page.tsx    # Detail & histori kendaraan
│   └── api/
│       ├── auth/...        # Auth.js API routes
│       ├── cron/           # Dipanggil Vercel Cron → cek & kirim reminder
│       └── push/           # Subscribe/unsubscribe push notification
├── components/             # UI components (shadcn/ui)
├── lib/
│   ├── db/                 # Drizzle schema, connection, migrations
│   ├── auth.ts             # Auth.js config
│   └── utils.ts
├── drizzle.config.ts
├── public/
│   └── sw.js               # Service Worker (Web Push)
└── next.config.ts
```

## Data Model

### users
| Column | Type | Constraint |
|---|---|---|
| id | uuid | PK |
| email | text | UNIQUE, NOT NULL |
| password | text | NOT NULL (hashed) |
| name | text | |
| created_at | timestamp | |

### vehicles
| Column | Type | Constraint |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users |
| plate | text | NOT NULL |
| name | text | |
| stnk_url | text | opsional |
| created_at | timestamp | |

### kir_records
| Column | Type | Constraint |
|---|---|---|
| id | uuid | PK |
| vehicle_id | uuid | FK → vehicles |
| start_date | date | NOT NULL |
| end_date | date | NOT NULL |
| notes | text | opsional |
| created_at | timestamp | |

### service_records
| Column | Type | Constraint |
|---|---|---|
| id | uuid | PK |
| vehicle_id | uuid | FK → vehicles |
| service_date | date | NOT NULL |
| type | enum | rutin / besar / lainnya |
| notes | text | |
| next_service_date | date | dihitung otomatis +3 bulan |
| created_at | timestamp | |

### push_subscriptions
| Column | Type | Constraint |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users |
| endpoint | text | NOT NULL |
| p256dh | text | NOT NULL |
| auth | text | NOT NULL |
| created_at | timestamp | |

### notifications
| Column | Type | Constraint |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users |
| vehicle_id | uuid | FK → vehicles |
| type | enum | kir / service |
| message | text | NOT NULL |
| is_read | boolean | default false |
| due_date | date | |
| created_at | timestamp | |

### Aturan Bisnis

- `service_records.next_service_date` = `service_date` + 3 bulan (dihitung otomatis oleh Server Action saat create/edit)
- `kir_records.end_date` = `start_date` + 6 bulan (dihitung otomatis oleh Server Action saat create/edit)
- Status kendaraan dihitung on-the-fly:
  - **aman**: deadline > 30 hari dari sekarang
  - **mendekati**: deadline ≤ 30 hari dari sekarang
  - **terlambat**: deadline < hari ini

## Routes & Halaman

| Route | Halaman | Auth |
|---|---|---|
| `/login` | Login form (email + password) | Public |
| `/register` | Register form (name + email + password) | Public |
| `/` | Dashboard — ringkasan semua kendaraan + status | Protected |
| `/vehicles` | Daftar kendaraan + tombol tambah | Protected |
| `/vehicles/new` | Form tambah kendaraan baru | Protected |
| `/vehicles/[id]` | Detail kendaraan + histori KIR & servis | Protected |

## Flow Reminder

```
Vercel Cron (setiap hari jam 7 pagi WIB, di-trigger cron schedule)
  └─► GET /api/cron/check-reminders (protected by CRON_SECRET header)
        │
        ├─ Scan kir_records.end_date
        │   └─ Apakah H-30, H-14, H-7, H-3, H-1 dari hari ini?
        │       └─ YES → Insert ke notifications + Web Push
        │
        └─ Scan service_records.next_service_date
            └─ Apakah H-30, H-14, H-7, H-3, H-1 dari hari ini?
                └─ YES → Insert ke notifications + Web Push

Push Notification (Service Worker)
  └─► public/sw.js
        └─► Tampilkan notifikasi OS
              └─► Klik → buka dashboard /vehicles/[id]
```

## Auth Flow

1. **Register**: POST Server Action → hash password (bcrypt) → insert user → auto sign-in → redirect `/`
2. **Login**: Auth.js Credentials Provider → cek email + password di DB → JWT session cookie → redirect `/`
3. **Middleware**: `/` dan `/vehicles/*` = protected; `/login`, `/register` = public

## Dashboard UI

- Header: logo/nama app + user avatar + bell notification (badge unread)
- Ringkasan: 3 card (total kendaraan, KIR mendekati, servis terlambat)
- Daftar kendaraan: card per kendaraan dengan badge status (hijau/kuning/merah) + tanggal KIR & servis
- FAB (floating action button) "+" di kanan bawah untuk tambah kendaraan
- Bottom nav bar di mobile (Dashboard, Kendaraan)
- Mobile-first design

## Testing Strategy

- **Unit**: Logic status kendaraan (`aman`, `mendekati`, `terlambat`)
- **Integration**: CRUD kendaraan via Server Actions
- **E2E**: Flow login → dashboard → tambah kendaraan → cek status

## Deployment

- Vercel (Hobby tier)
- Neon PostgreSQL (free tier, 0.5GB)
- Vercel Cron Jobs (free tier: 1 cron job)
- VAPID keys di environment variables
