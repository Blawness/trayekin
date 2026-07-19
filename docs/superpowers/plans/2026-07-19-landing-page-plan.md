# Landing Page Trayekin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bangun landing page pra-launch di `/` sebagai route publik statis, dengan CTA WhatsApp, sekaligus memindahkan dashboard ke `/dashboard`.

**Architecture:** Route group `(marketing)` baru berisi layout publik dan `page.tsx` yang menyusun tujuh section dari `_sections/`. Dashboard dipindah dari `(app)/page.tsx` ke `(app)/dashboard/page.tsx` karena dua route group tidak boleh sama-sama punya `page.tsx` di akar. Middleware diubah dari "semua wajib login kecuali halaman auth" menjadi daftar route publik eksplisit. Semua section adalah Server Component tanpa JavaScript klien.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (base-nova, `@base-ui/react`), lucide-react, `next/font/google`.

**Spec:** `docs/superpowers/specs/2026-07-19-landing-page-design.md`

## Global Constraints

- **Semua teks UI dalam Bahasa Indonesia.** Membumi, gaya bicara ke operator angkot. Dilarang jargon startup/teknis: "SaaS", "multi-tenant", "onboarding", "dashboard" (dalam copy publik).
- **Mobile-first wajib.** Rancang dari viewport 360px dulu, desktop menyusul lewat prefix `sm:`/`lg:`.
- **Tidak ada test runner di repo ini.** `AGENTS.md` menyatakan ini eksplisit. Jangan menambahkan Vitest/Jest. Siklus verifikasi tiap task: `pnpm build` (sekaligus typecheck) + `pnpm lint` + cek manual.
- **Semua section Server Component.** Jangan tambahkan `"use client"` di file mana pun dalam `(marketing)/`. Menambahkannya membuat halaman kehilangan status statis.
- **Jangan panggil `auth()` di mana pun dalam `(marketing)/`.** Itu membuat halaman dinamis. Tombol "Masuk" selalu mengarah ke `/login`; `src/proxy.ts` yang menangani user ber-sesi.
- **Jangan menjanjikan fitur yang belum ada.** Dilarang menyebut multi-tenant, dashboard koperasi, atau billing otomatis di copy.
- **Jangan tampilkan angka harga.** Hanya "Gratis selama masa beta".
- **Palet dan radius permukaan UI pakai token yang sudah ada.** `bg-primary`, `text-muted-foreground`, `rounded-lg`, dst. Jangan hardcode warna hex atau oklch.

  Pengecualian: ilustrasi benda fisik — saat ini hanya frame HP di `phone-mockup.tsx` — boleh memakai radius mentah (`rounded-[2rem]`). Lengkung casing HP adalah properti benda yang digambar, bukan permukaan UI, dan skala `--radius-*` (mentok di 1.625rem) memang bukan peruntukannya. Pengecualian ini tidak berlaku untuk kartu, tombol, atau input di dalam mockup.

- **Warna status harus cocok dengan `src/lib/utils/status.ts`.** Aplikasi memakai kosakata tiga status — aman, mendekati, terlambat — dengan keluarga warna green/yellow/red. Mockup landing page harus memakai keluarga yang sama supaya benar-benar mencerminkan tampilan produk. Jangan memakai emerald atau amber.
- **Jangan sentuh** `docs/superpowers/CLAUDE-CODE-HANDOFF.md`, `trayekin-saas-strategy.md`, `trayekin-financial-model.xlsx` — file untracked yang sengaja tidak di-commit ke repo publik.
- **Jangan migrasi NextAuth v5 ke library lain.** Jangan refactor yang tidak diminta.
- **`Button` di repo ini TIDAK punya prop `asChild`.** Itu pola Radix; repo ini memakai `@base-ui/react`. Untuk merender tombol sebagai link, pakai prop `render` plus `nativeButton={false}`:

  ```tsx
  <Button render={<Link href="/login" />} nativeButton={false}>Masuk</Button>
  ```

  `nativeButton={false}` wajib ketika elemen hasil render bukan `<button>` — nilai default-nya `true` dan akan salah menangani keyboard serta ARIA untuk anchor. Menulis `asChild` akan lolos runtime tapi menghasilkan HTML rusak (tombol membungkus link) dan memicu peringatan React.

---

### Task 1: Pindahkan dashboard ke `/dashboard` dan buka route publik

Ini fondasi. Sampai task ini selesai, `(marketing)/page.tsx` tidak bisa ditambahkan karena akan bentrok di route `/`.

Setelah task ini, `/` akan menghasilkan 404 sampai Task 3 — itu diharapkan dan bukan kegagalan.

**Files:**
- Move: `src/app/(app)/page.tsx` → `src/app/(app)/dashboard/page.tsx`
- Modify: `src/proxy.ts`
- Modify: `src/components/auth-form.tsx:33`
- Modify: `src/app/(app)/layout.tsx:20`
- Modify: `src/lib/actions/vehicles.ts:53`
- Modify: `src/lib/actions/notifications.ts:78`

**Interfaces:**
- Consumes: —
- Produces: route `/dashboard` sebagai halaman dashboard. Route `/` bebas dipakai Task 3. Konstanta `PUBLIC_ROUTES` di `src/proxy.ts`.

- [ ] **Step 1: Pindahkan file dashboard**

```bash
mkdir -p "src/app/(app)/dashboard"
git mv "src/app/(app)/page.tsx" "src/app/(app)/dashboard/page.tsx"
```

Isi file tidak diubah sama sekali. Fungsinya sudah bernama `DashboardPage`.

- [ ] **Step 2: Ganti middleware jadi daftar route publik**

Ganti seluruh isi `src/proxy.ts` dengan:

```ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

export default auth((req) => {
  const isAuth = !!req.auth;
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isPublicPage = PUBLIC_ROUTES.includes(pathname) || isAuthPage;

  if (!isAuth && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

Perhatikan: `PUBLIC_ROUTES.includes(pathname)` memakai perbandingan persis, bukan `startsWith`. Ini disengaja — `startsWith("/")` akan cocok dengan semua route dan membocorkan seluruh aplikasi.

- [ ] **Step 3: Arahkan redirect setelah login ke dashboard**

Di `src/components/auth-form.tsx` baris 33, ganti:

```tsx
      router.push("/");
```

menjadi:

```tsx
      router.push("/dashboard");
```

- [ ] **Step 4: Arahkan logo header app ke dashboard**

Di `src/app/(app)/layout.tsx` baris 20, ganti:

```tsx
          <Link href="/" className="font-bold text-lg tracking-tight text-primary">
```

menjadi:

```tsx
          <Link href="/dashboard" className="font-bold text-lg tracking-tight text-primary">
```

- [ ] **Step 5: Perbaiki dua panggilan revalidatePath**

Di `src/lib/actions/vehicles.ts` baris 53, ganti:

```ts
    revalidatePath("/");
```

menjadi:

```ts
    revalidatePath("/dashboard");
```

Di `src/lib/actions/notifications.ts` baris 78, ganti:

```ts
    revalidatePath("/", "layout");
```

menjadi:

```ts
    revalidatePath("/dashboard", "layout");
```

Perubahan kedua adalah perbaikan bug, bukan sekadar penyesuaian path. `revalidatePath("/", "layout")` membatalkan cache semua route yang berbagi root layout — termasuk landing page statis yang akan dibuat di Task 3. Tanpa perbaikan ini, setiap user yang membaca notifikasi membuat landing page kehilangan pre-render-nya.

- [ ] **Step 6: Pastikan tidak ada link ke `/` yang tersisa**

```bash
grep -rn 'href="/"\|push("/")\|redirect("/")\|revalidatePath("/")' src/
grep -rn ': *"/"' src/ public/
```

Expected: kedua perintah tidak menghasilkan apa-apa. Kalau ada, perbaiki jadi `/dashboard` sebelum lanjut.

Perintah kedua wajib dan tidak boleh dilewati. Perintah pertama hanya cocok dengan sintaks atribut JSX (`href="/"`), sehingga melewatkan rujukan berbentuk properti objek — misalnya `href: "/"` di `src/components/bottom-nav.tsx` dan `url: "/"` di payload notifikasi push. Keduanya nyata terlewat saat plan ini pertama dijalankan.

- [ ] **Step 7: Verifikasi build dan lint**

```bash
pnpm build && pnpm lint
```

Expected: build sukses, lint bersih. Di output build, `/dashboard` muncul sebagai route dan `/` tidak ada.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: pindahkan dashboard ke /dashboard, buka route publik

Menyiapkan / untuk landing page. Middleware kini memakai daftar
route publik eksplisit. Sekalian memperbaiki revalidatePath('/', 'layout')
di notifications yang membatalkan cache seluruh root layout."
```

---

### Task 2: Tambah font Plus Jakarta Sans dan hilangkan kedipan tema

Dua perubahan ini menyentuh file yang sama (`src/app/layout.tsx`) dan sama-sama soal tampilan awal halaman, jadi digabung.

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: —
- Produces: `font-sans` di seluruh aplikasi memakai Plus Jakarta Sans. Class `dark` terpasang sebelum halaman digambar.

- [ ] **Step 1: Tulis ulang root layout**

Ganti seluruh isi `src/app/layout.tsx` dengan:

```tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trayekin — Pengingat KIR & Servis",
  description: "Kelola KIR dan servis kendaraan operasional Anda.",
};

const themeScript = `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
```

Skrip tema ditulis inline di `<head>` supaya berjalan sebelum browser menggambar halaman. Kalau ditaruh di `useEffect` (seperti `theme-toggle.tsx` sekarang), user ber-dark-mode melihat halaman terang sepersekian detik dulu. `try/catch` melindungi dari browser yang memblokir `localStorage`.

- [ ] **Step 2: Daftarkan variabel font ke tema Tailwind**

Buka `src/app/globals.css`, cari blok `@theme inline {` (sekitar baris 3). Tambahkan baris ini tepat setelah baris pembuka blok tersebut:

```css
  --font-sans: var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;
```

Tanpa baris ini, class `font-sans` tidak tahu variabel yang dibuat `next/font`, dan fontnya tidak akan terpakai meskipun sudah ke-load.

Perhatikan kedua nama variabel harus berbeda: `next/font` membuat `--font-jakarta`, lalu token Tailwind `--font-sans` menunjuk ke sana. Menamai keduanya `--font-sans` menghasilkan `--font-sans: var(--font-sans)` — referensi melingkar yang membuat properti tersebut invalid, sehingga font gagal terpakai tanpa pesan error apa pun.

- [ ] **Step 3: Verifikasi build dan lint**

```bash
pnpm build && pnpm lint
```

Expected: build sukses, lint bersih.

- [ ] **Step 4: Cek manual bahwa font terpakai dan tema tidak berkedip**

```bash
pnpm dev
```

Buka `http://localhost:3000/login`. Font harus terlihat berbeda dari sebelumnya (Plus Jakarta Sans punya huruf `a` dan `g` yang khas, lebih bulat dari font sistem).

Lalu di DevTools, set emulasi `prefers-color-scheme: dark` (Rendering panel), hard-reload. Halaman harus langsung gelap tanpa kedipan putih.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: tambah Plus Jakarta Sans dan cegah kedipan tema

Font di-self-host lewat next/font (tanpa request ke server Google).
Class dark kini dipasang sebelum halaman digambar, bukan di useEffect."
```

---

### Task 3: Layout marketing, konstanta WhatsApp, dan hero

Task ini mengembalikan route `/` dan menghasilkan halaman pertama yang bisa dilihat.

**Files:**
- Create: `src/lib/whatsapp.ts`
- Create: `src/app/(marketing)/layout.tsx`
- Create: `src/app/(marketing)/page.tsx`
- Create: `src/app/(marketing)/_sections/hero.tsx`

**Interfaces:**
- Consumes: route `/` yang sudah dibebaskan Task 1.
- Produces:
  - `WHATSAPP_NUMBER: string` dan `whatsappUrl(pesan?: string): string` dari `@/lib/whatsapp`
  - `<Hero />` dari `@/app/(marketing)/_sections/hero` — tanpa props
  - `src/app/(marketing)/page.tsx` sebagai tempat semua section berikutnya dirangkai

- [ ] **Step 1: Buat konstanta WhatsApp**

Buat `src/lib/whatsapp.ts`:

```ts
/**
 * Nomor WhatsApp tujuan CTA landing page, format internasional tanpa "+".
 * Contoh: "6281234567890" untuk 0812-3456-7890.
 *
 * BELUM DIISI — landing page tidak boleh naik production sebelum nomor ini benar.
 */
export const WHATSAPP_NUMBER = "6281234567890";

const PESAN_DEFAULT = "Halo, saya mau tanya soal Trayekin untuk angkot saya.";

export function whatsappUrl(pesan: string = PESAN_DEFAULT): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(pesan)}`;
}
```

Nomor di atas adalah placeholder. Jangan menebak nomor asli.

- [ ] **Step 2: Buat layout marketing**

Buat `src/app/(marketing)/layout.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="font-bold text-lg tracking-tight text-primary">
            Trayekin
          </Link>
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            variant="ghost"
            size="sm"
          >
            Masuk
          </Button>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-5xl space-y-3 px-4 py-8 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Trayekin</p>
          <p>
            Trayekin adalah produk independen, tidak berafiliasi dengan JakLingko
            atau Pemerintah Provinsi DKI Jakarta.
          </p>
          <p>&copy; {new Date().getFullYear()} Trayekin</p>
        </div>
      </footer>
    </div>
  );
}
```

Tombol "Masuk" selalu mengarah ke `/login` tanpa mengecek sesi. Ini disengaja — memanggil `auth()` di sini membuat halaman dinamis. `src/proxy.ts` sudah me-redirect user yang sudah login dari `/login` ke `/dashboard`.

- [ ] **Step 3: Buat section hero**

Buat `src/app/(marketing)/_sections/hero.tsx`:

```tsx
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/whatsapp";

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Tau nggak unit mana yang bikin Anda rugi?
          </h1>

          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Catat setoran harian per angkot, dapat pengingat KIR &amp; STNK
            otomatis, dan lihat untung bersih tiap unit tiap bulan.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              render={
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" />
              }
              nativeButton={false}
              size="lg"
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Tanya via WhatsApp
            </Button>
            <Button
              render={<Link href="/login" />}
              nativeButton={false}
              size="lg"
              variant="outline"
            >
              Masuk
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Dibuat untuk pemilik angkot trayek JakLingko.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          {/* Mockup HP ditambahkan di Task 4 */}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Buat halaman landing**

Buat `src/app/(marketing)/page.tsx`:

```tsx
import { Hero } from "./_sections/hero";

export default function LandingPage() {
  return <Hero />;
}
```

Metadata ditambahkan di Task 7.

- [ ] **Step 5: Verifikasi build dan lint**

```bash
pnpm build && pnpm lint
```

Expected: build sukses. Di output build, `/` muncul kembali sebagai route dan ditandai statis (simbol `○`), bukan dinamis (`ƒ`). Kalau ditandai dinamis, berarti ada pemanggilan `auth()` atau API dinamis yang tidak sengaja masuk — perbaiki sebelum lanjut.

- [ ] **Step 6: Cek manual dalam keadaan logout**

```bash
pnpm dev
```

Buka `http://localhost:3000/` di jendela penyamaran (supaya tidak ada sesi). Hero harus tampil tanpa dilempar ke `/login`. Lebarkan/kecilkan ke 360px — teks tidak boleh terpotong dan halaman tidak boleh bisa di-scroll ke samping.

- [ ] **Step 7: Commit**

```bash
git add "src/app/(marketing)" src/lib/whatsapp.ts
git commit -m "feat: landing page dengan layout marketing dan hero

CTA WhatsApp memakai konstanta ber-placeholder di src/lib/whatsapp.ts
yang harus diisi sebelum production."
```

---

### Task 4: Mockup HP di hero

**Files:**
- Create: `src/app/(marketing)/_sections/phone-mockup.tsx`
- Modify: `src/app/(marketing)/_sections/hero.tsx`

**Interfaces:**
- Consumes: `<Hero />` dari Task 3.
- Produces: `<PhoneMockup />` dari `@/app/(marketing)/_sections/phone-mockup` — tanpa props.

- [ ] **Step 1: Buat komponen mockup**

Buat `src/app/(marketing)/_sections/phone-mockup.tsx`:

```tsx
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const UNIT_CONTOH = [
  { plat: "B 1234 XYZ", info: "KIR jatuh tempo 12 hari lagi", status: "mendekati" as const },
  { plat: "B 5678 ABC", info: "STNK terlambat 3 hari", status: "terlambat" as const },
  { plat: "B 9012 DEF", info: "Semua dokumen aman", status: "aman" as const },
];

// Keluarga warna mengikuti getStatusColor() di src/lib/utils/status.ts supaya
// mockup benar-benar menyerupai tampilan aplikasi. Varian dark ditambahkan di
// sini karena landing page mendukung dua tema, sedangkan badge di dalam
// aplikasi belum.
const GAYA_STATUS = {
  aman: { kelas: "text-green-700 dark:text-green-400", Ikon: CheckCircle2 },
  mendekati: { kelas: "text-yellow-700 dark:text-yellow-400", Ikon: Clock },
  terlambat: { kelas: "text-red-700 dark:text-red-400", Ikon: AlertTriangle },
};

export function PhoneMockup() {
  return (
    <div
      aria-hidden="true"
      className="w-[260px] rounded-[2rem] border-8 border-foreground/85 bg-background shadow-2xl shadow-primary/10 sm:w-[280px]"
    >
      <div className="space-y-3 rounded-[1.4rem] p-4">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-sm font-bold text-primary">Trayekin</span>
          <span className="text-[10px] text-muted-foreground">3 kendaraan</span>
        </div>

        {UNIT_CONTOH.map((unit) => {
          const { kelas, Ikon } = GAYA_STATUS[unit.status];
          return (
            <div key={unit.plat} className="rounded-lg border bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{unit.plat}</span>
                <Ikon className={`h-3.5 w-3.5 ${kelas}`} />
              </div>
              <p className={`mt-1 text-[11px] ${kelas}`}>{unit.info}</p>
            </div>
          );
        })}

        <div className="rounded-lg bg-primary/10 p-3">
          <p className="text-[10px] text-muted-foreground">Untung bersih bulan ini</p>
          <p className="text-lg font-bold text-primary">Rp 4.850.000</p>
        </div>
      </div>
    </div>
  );
}
```

Semua data di atas karangan dan sengaja tidak menyerupai data pilot asli. `aria-hidden` dipasang karena ini gambar dekoratif — pembaca layar tidak perlu membacakan angka fiktif.

- [ ] **Step 2: Pasang mockup ke hero**

Di `src/app/(marketing)/_sections/hero.tsx`, tambahkan import di bawah import `whatsappUrl`:

```tsx
import { PhoneMockup } from "./phone-mockup";
```

Lalu ganti baris komentar placeholder:

```tsx
          {/* Mockup HP ditambahkan di Task 4 */}
```

menjadi:

```tsx
          <PhoneMockup />
```

- [ ] **Step 3: Verifikasi build dan lint**

```bash
pnpm build && pnpm lint
```

Expected: build sukses, `/` tetap statis (`○`), lint bersih.

- [ ] **Step 4: Cek manual di dua tema dan dua lebar**

Buka `/` di 360px dan di desktop. Di HP, mockup tampil di bawah CTA. Di desktop, di samping kanan. Ganti ke dark mode — mockup harus tetap terbaca, tidak ada teks gelap di atas latar gelap.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(marketing)/_sections"
git commit -m "feat: mockup HP di hero landing page

Murni HTML+CSS dengan data karangan. Tanpa gambar, tanpa JavaScript,
dan tidak memakai data pilot asli."
```

---

### Task 5: Section masalah, solusi, dan cara kerja

**Files:**
- Create: `src/app/(marketing)/_sections/masalah.tsx`
- Create: `src/app/(marketing)/_sections/solusi.tsx`
- Create: `src/app/(marketing)/_sections/cara-kerja.tsx`
- Modify: `src/app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `src/app/(marketing)/page.tsx` dari Task 3.
- Produces: `<Masalah />`, `<Solusi />`, `<CaraKerja />` — semuanya tanpa props.

- [ ] **Step 1: Buat section masalah**

Buat `src/app/(marketing)/_sections/masalah.tsx`:

```tsx
import { BookX, TrendingDown, TriangleAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const MASALAH = [
  {
    Ikon: TriangleAlert,
    judul: "Telat KIR atau STNK",
    isi: "Kena denda, dan angkot tidak boleh jalan. Sehari tidak jalan berarti setoran hilang.",
  },
  {
    Ikon: BookX,
    judul: "Setoran dicatat di buku",
    isi: "Gampang lupa, gampang bocor, dan susah dicek ulang kalau ada yang tidak cocok.",
  },
  {
    Ikon: TrendingDown,
    judul: "Tidak tahu unit mana yang boncos",
    isi: "Semua terlihat jalan normal, padahal ada satu unit yang nombok tiap bulan.",
  },
];

export function Masalah() {
  return (
    <section className="border-t bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          Ngurus angkot itu ribet kalau semuanya diingat sendiri
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {MASALAH.map(({ Ikon, judul, isi }) => (
            <Card key={judul}>
              <CardContent className="space-y-2 pt-6">
                <Ikon className="h-6 w-6 text-destructive" />
                <h3 className="font-semibold">{judul}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{isi}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Buat section solusi**

Buat `src/app/(marketing)/_sections/solusi.tsx`:

```tsx
import { BellRing, NotebookPen, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SOLUSI = [
  {
    Ikon: BellRing,
    judul: "Pengingat otomatis",
    isi: "Diberi tahu jauh hari sebelum KIR, STNK, atau servis jatuh tempo. Masuk langsung ke HP Anda.",
  },
  {
    Ikon: NotebookPen,
    judul: "Buku kas harian",
    isi: "Catat setoran dan pengeluaran per angkot setiap hari. Tidak perlu hitung manual lagi.",
  },
  {
    Ikon: Wallet,
    judul: "Laporan untung-rugi",
    isi: "Lihat untung bersih tiap unit per bulan, lengkap dengan biaya BBM dan servis.",
  },
];

export function Solusi() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
        Semua dicatat di satu tempat, pengingatnya jalan sendiri
      </h2>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Dibuat untuk pemilik unit yang pegang sendiri operasionalnya, juga untuk
        pengurus koperasi yang mengawasi beberapa unit sekaligus.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {SOLUSI.map(({ Ikon, judul, isi }) => (
          <Card key={judul}>
            <CardContent className="space-y-2 pt-6">
              <Ikon className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">{judul}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{isi}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
```

Paragraf kedua adalah tempat "untuk siapa" dilebur, sesuai §4 spec. Ketiga fitur di atas sudah ada di aplikasi hari ini — jangan menambah fitur lain ke daftar ini.

- [ ] **Step 3: Buat section cara kerja**

Buat `src/app/(marketing)/_sections/cara-kerja.tsx`:

```tsx
const LANGKAH = [
  {
    judul: "Daftar",
    isi: "Buat akun pakai email. Gratis, tidak perlu kartu kredit.",
  },
  {
    judul: "Masukkan data angkot",
    isi: "Isi plat nomor dan tanggal KIR terakhir. Cukup sekali di awal.",
  },
  {
    judul: "Catat harian, sisanya otomatis",
    isi: "Setiap hari catat setoran. Pengingat dan laporan jalan sendiri.",
  },
];

export function CaraKerja() {
  return (
    <section className="border-t bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          Cuma tiga langkah
        </h2>

        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {LANGKAH.map(({ judul, isi }, i) => (
            <li key={judul} className="space-y-2">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground"
              >
                {i + 1}
              </span>
              <h3 className="font-semibold">{judul}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{isi}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Rangkai ke halaman**

Ganti seluruh isi `src/app/(marketing)/page.tsx` dengan:

```tsx
import { Hero } from "./_sections/hero";
import { Masalah } from "./_sections/masalah";
import { Solusi } from "./_sections/solusi";
import { CaraKerja } from "./_sections/cara-kerja";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Masalah />
      <Solusi />
      <CaraKerja />
    </>
  );
}
```

- [ ] **Step 5: Verifikasi build dan lint**

```bash
pnpm build && pnpm lint
```

Expected: build sukses, `/` tetap statis (`○`), lint bersih.

- [ ] **Step 6: Cek manual**

Buka `/` di 360px. Ketiga section harus menumpuk satu kolom, latar belakangnya berselang-seling (putih, abu, putih, abu), dan tidak ada scroll horizontal.

- [ ] **Step 7: Commit**

```bash
git add "src/app/(marketing)"
git commit -m "feat: section masalah, solusi, dan cara kerja"
```

---

### Task 6: Section kepercayaan, harga, dan FAQ + CTA penutup

**Files:**
- Create: `src/app/(marketing)/_sections/kepercayaan.tsx`
- Create: `src/app/(marketing)/_sections/harga.tsx`
- Create: `src/app/(marketing)/_sections/faq-cta.tsx`
- Modify: `src/app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `whatsappUrl()` dari `@/lib/whatsapp` (Task 3), `src/app/(marketing)/page.tsx` (Task 5).
- Produces: `<Kepercayaan />`, `<Harga />`, `<FaqCta />` — semuanya tanpa props. Halaman landing lengkap tujuh section.

- [ ] **Step 1: Buat section kepercayaan**

Buat `src/app/(marketing)/_sections/kepercayaan.tsx`:

```tsx
export function Kepercayaan() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <blockquote className="rounded-xl border bg-card p-6 text-center sm:p-8">
        <p className="text-lg font-medium text-balance sm:text-xl">
          Sedang dipakai mengelola 5 unit angkot JakLingko di Jakarta Timur.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Trayekin masih dalam masa beta bersama operator pertama.
        </p>
      </blockquote>
    </section>
  );
}
```

Jangan menambah angka, testimoni, atau logo apa pun ke section ini. Satu kalimat di atas adalah satu-satunya klaim yang benar hari ini.

- [ ] **Step 2: Buat section harga**

Buat `src/app/(marketing)/_sections/harga.tsx`:

```tsx
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TERMASUK = [
  "Semua kendaraan Anda",
  "Pengingat KIR, STNK, dan servis",
  "Buku kas harian dan laporan untung-rugi",
];

export function Harga() {
  return (
    <section className="border-t bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Harga</h2>

        <Card className="mt-6 max-w-md">
          <CardContent className="space-y-4 pt-6">
            <p className="text-2xl font-extrabold text-primary">
              Gratis selama masa beta.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Harga akan ditentukan bersama operator yang ikut dari awal.
            </p>

            <ul className="space-y-2 border-t pt-4">
              {TERMASUK.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
```

Dilarang menambahkan angka harga ke section ini. Billing belum dibangun — angka apa pun di sini akan memicu pertanyaan "cara bayarnya gimana" yang belum ada jawabannya.

- [ ] **Step 3: Buat section FAQ dan CTA penutup**

Buat `src/app/(marketing)/_sections/faq-cta.tsx`:

```tsx
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/whatsapp";

const FAQ = [
  {
    tanya: "Data saya aman?",
    jawab:
      "Data Anda hanya bisa dibuka pakai akun Anda sendiri. Pemilik lain tidak bisa melihat kendaraan atau catatan keuangan Anda.",
  },
  {
    tanya: "Ribet nggak pakainya?",
    jawab:
      "Sehari-harinya cuma mencatat setoran, sekitar satu menit per angkot. Pengisian data yang agak panjang hanya sekali di awal.",
  },
  {
    tanya: "Bisa dari HP saja?",
    jawab:
      "Bisa. Trayekin dibuat untuk dipakai dari HP. Tidak perlu memasang aplikasi, cukup buka lewat browser.",
  },
  {
    tanya: "Butuh internet terus?",
    jawab:
      "Butuh internet saat mencatat dan membuka laporan. Pemakaian datanya kecil karena tidak ada video atau gambar berat.",
  },
];

export function FaqCta() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Pertanyaan yang sering ditanya
      </h2>

      <dl className="mt-8 grid gap-6 sm:grid-cols-2">
        {FAQ.map(({ tanya, jawab }) => (
          <div key={tanya} className="space-y-1.5">
            <dt className="font-semibold">{tanya}</dt>
            <dd className="text-sm leading-relaxed text-muted-foreground">{jawab}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 rounded-xl border bg-card p-6 text-center sm:p-10">
        <h3 className="text-xl font-bold text-balance sm:text-2xl">
          Mau coba untuk angkot Anda?
        </h3>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Chat langsung, nanti dibantu daftar dan memasukkan data angkot pertama.
        </p>
        <Button
          render={
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" />
          }
          nativeButton={false}
          size="lg"
          className="mt-6 gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Tanya via WhatsApp
        </Button>
      </div>
    </section>
  );
}
```

FAQ ditulis sebagai `<dl>` statis, bukan accordion. Accordion butuh `"use client"` dan membuat halaman kehilangan status statis — untuk empat pertanyaan pendek, harganya tidak sepadan.

- [ ] **Step 4: Rangkai halaman lengkap**

Ganti seluruh isi `src/app/(marketing)/page.tsx` dengan:

```tsx
import { Hero } from "./_sections/hero";
import { Masalah } from "./_sections/masalah";
import { Solusi } from "./_sections/solusi";
import { CaraKerja } from "./_sections/cara-kerja";
import { Kepercayaan } from "./_sections/kepercayaan";
import { Harga } from "./_sections/harga";
import { FaqCta } from "./_sections/faq-cta";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Masalah />
      <Solusi />
      <CaraKerja />
      <Kepercayaan />
      <Harga />
      <FaqCta />
    </>
  );
}
```

- [ ] **Step 5: Verifikasi build dan lint**

```bash
pnpm build && pnpm lint
```

Expected: build sukses, `/` tetap statis (`○`), lint bersih.

- [ ] **Step 6: Pastikan tidak ada Client Component yang menyusup**

```bash
grep -rn '"use client"' "src/app/(marketing)/"
```

Expected: tidak ada hasil sama sekali.

- [ ] **Step 7: Cek manual seluruh halaman**

Buka `/` di 360px, scroll dari atas ke bawah. Ketujuh section muncul berurutan, tidak ada scroll horizontal, dan kedua tombol WhatsApp membuka `wa.me` dengan pesan awal terisi. Ulangi di dark mode.

- [ ] **Step 8: Commit**

```bash
git add "src/app/(marketing)"
git commit -m "feat: section kepercayaan, harga, dan FAQ + CTA penutup

Landing page lengkap tujuh section. FAQ sengaja statis, bukan accordion,
supaya halaman tetap tanpa JavaScript klien."
```

---

### Task 7: Metadata dan OG image

**Files:**
- Modify: `src/app/(marketing)/page.tsx`
- Create: `src/app/(marketing)/opengraph-image.tsx`

**Interfaces:**
- Consumes: halaman landing lengkap dari Task 6.
- Produces: metadata Bahasa Indonesia di `/` dan OG image yang di-generate saat build.

- [ ] **Step 1: Tambahkan metadata ke halaman landing**

Di `src/app/(marketing)/page.tsx`, tambahkan di bawah baris import terakhir (`import { FaqCta } ...`):

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trayekin — Kelola angkot dari HP",
  description:
    "Catat setoran harian per angkot, dapat pengingat KIR & STNK otomatis, dan lihat untung bersih tiap unit. Dibuat untuk pemilik angkot trayek JakLingko.",
  openGraph: {
    title: "Trayekin — Kelola angkot dari HP",
    description:
      "Pengingat KIR & STNK otomatis plus buku kas harian per angkot. Gratis selama masa beta.",
    locale: "id_ID",
    type: "website",
  },
};
```

Metadata ini menimpa metadata root layout khusus untuk route `/`.

**`metadataBase` TIDAK boleh ditaruh di sini — harus di `src/app/layout.tsx`.** Tanpa `metadataBase`, URL `og:image` di produksi menunjuk `http://localhost:3000` dan preview gagal muncul saat link dibagikan di WhatsApp — persis jalur distribusi produk ini. Menaruhnya di `page.tsx` tidak berpengaruh: `opengraph-image.tsx` yang ditemukan otomatis oleh Next hanya mewarisi `metadataBase` dari layout leluhur, bukan dari `metadata` milik `page.tsx` di sebelahnya. Ini sudah diuji: warning tetap muncul sampai deklarasinya dipindah ke root layout.

Di `src/app/layout.tsx`, tambahkan di atas `export const metadata`:

```ts
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
```

lalu `metadataBase: new URL(siteUrl),` sebagai properti pertama di dalam objek `metadata`. Nilainya diturunkan dari environment Vercel supaya ikut berubah sendiri kalau nanti dipasang domain kustom, dan jatuh ke localhost saat pengembangan lokal tanpa perlu konfigurasi apa pun.

- [ ] **Step 2: Buat OG image**

Buat `src/app/(marketing)/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og";

export const alt = "Trayekin — Kelola angkot dari HP";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700, color: "#1d4ed8" }}>
          Trayekin
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.15,
            color: "#0f172a",
          }}
        >
          Tau nggak unit mana yang bikin Anda rugi?
        </div>
        <div style={{ marginTop: 28, fontSize: 32, color: "#475569" }}>
          Pengingat KIR &amp; STNK otomatis + buku kas harian per angkot
        </div>
      </div>
    ),
    size,
  );
}
```

Warna di sini ditulis sebagai hex, bukan token Tailwind. Ini pengecualian yang perlu: `ImageResponse` merender di luar Tailwind dan tidak bisa membaca variabel CSS. Nilai `#1d4ed8` adalah padanan sRGB terdekat dari `--primary`. Kalau palet berubah, file ini harus disesuaikan manual.

- [ ] **Step 3: Verifikasi build dan lint**

```bash
pnpm build && pnpm lint
```

Expected: build sukses, lint bersih.

- [ ] **Step 4: Cek OG image ter-render**

```bash
pnpm dev
```

Buka `http://localhost:3000/opengraph-image` — harus muncul gambar 1200×630 berisi wordmark, headline, dan subheadline. Teks tidak boleh terpotong di tepi.

- [ ] **Step 5: Cek metadata terpasang**

Buka `http://localhost:3000/`, lihat source (Ctrl+U). Harus ada `<title>Trayekin — Kelola angkot dari HP</title>` dan tag `og:image` yang menunjuk ke `/opengraph-image`.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(marketing)"
git commit -m "feat: metadata Bahasa Indonesia dan OG image landing page

OG image di-generate saat build dari JSX, jadi tidak basi ketika copy berubah."
```

---

## Verifikasi akhir

Setelah ketujuh task selesai, jalankan seluruh pemeriksaan ini sekaligus:

- [ ] `pnpm build` sukses. Di tabel route, `/` bertanda `○` (statis) dan `/dashboard` ada.
- [ ] `pnpm lint` bersih.
- [ ] `grep -rn '"use client"' "src/app/(marketing)/"` tidak menghasilkan apa-apa.
- [ ] `grep -rn 'asChild' src/` tidak menghasilkan apa-apa. Prop itu tidak ada di `@base-ui/react` dan akan menghasilkan HTML rusak tanpa menggagalkan build.
- [ ] Di DevTools, tombol "Tanya via WhatsApp" dan "Masuk" ter-render sebagai `<a>`, bukan `<button>` yang membungkus `<a>`.
- [ ] `grep -rn 'href="/"\|push("/")\|redirect("/")\|revalidatePath("/")' src/` tidak menghasilkan apa-apa.
- [ ] `grep -rn ': *"/"' src/ public/` tidak menghasilkan apa-apa. Pola ini menangkap rujukan berbentuk properti objek yang dilewatkan pola di atas.
- [ ] Di dalam aplikasi, tab "Dasbor" di bottom nav membuka `/dashboard` dan tersorot aktif saat berada di halaman itu.
- [ ] Dalam keadaan logout, `/` menampilkan landing page tanpa redirect ke `/login`.
- [ ] Login lewat `/login` mendarat di `/dashboard`.
- [ ] Dalam keadaan login, membuka `/` tetap menampilkan landing page.
- [ ] Dalam keadaan logout, membuka `/vehicles` dilempar ke `/login`.
- [ ] Di viewport 360px, halaman tidak bisa di-scroll ke samping.
- [ ] Dark mode tidak berkedip putih saat hard-reload.
- [ ] Kedua tombol WhatsApp membuka `wa.me` dengan pesan awal terisi.
- [ ] `pnpm build` tidak memunculkan peringatan `metadataBase`. Kalau muncul, preview OG di produksi akan menunjuk localhost dan gagal dimuat saat link dibagikan.

## Sebelum deploy production

- [ ] **Isi `WHATSAPP_NUMBER` di `src/lib/whatsapp.ts`.** Nilai sekarang adalah placeholder `6281234567890`. Landing page tidak boleh naik production sebelum ini benar.
