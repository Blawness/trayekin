# Landing Page Trayekin — Design Spec

**Tanggal:** 2026-07-19
**Status:** disetujui, siap masuk tahap rencana implementasi
**Konteks:** `docs/superpowers/CLAUDE-CODE-HANDOFF.md` (§6 brief landing page)

---

## 1. Tujuan

Landing page pra-launch untuk Trayekin, dibangun di repo yang sama sebagai route publik.

Tugasnya dua: menjelaskan apa itu Trayekin dan untuk siapa, lalu menangkap minat lewat WhatsApp. Bukan halaman checkout — billing dan multi-tenant belum ada.

**Target:** pemilik unit angkot trayek JakLingko, 1–10 kendaraan, mayoritas di lapangan dan membuka dari HP Android. Sekunder: pengurus/pengawas koperasi sebagai pintu distribusi.

**Kompetitor sebenarnya:** buku tulis, WhatsApp, Excel, dan ingatan. Copy harus menang melawan "ah saya catat manual saja".

---

## 2. Keputusan yang sudah diambil

| Topik | Keputusan |
|---|---|
| Lokasi | Repo yang sama, route group `(marketing)` di `/` |
| Dashboard | Pindah dari `/` ke `/dashboard` |
| CTA utama | Tombol WhatsApp. Tidak ada form waitlist. |
| Penyebutan JakLingko | Sebagai konteks, bukan afiliasi. Disclaimer di footer. |
| Harga | "Gratis selama masa beta". Tanpa angka. |
| Palet | Pakai token yang sudah ada (`--primary: oklch(0.48 0.18 255)`) |
| Tipografi | Tambah Plus Jakarta Sans via `next/font/google` di root layout |
| Visual hero | Mockup HTML dalam frame HP, data dummy. Bukan screenshot. |
| Struktur kode | Section components di `_sections/`, mengikuti pola `vehicles/[id]/_sections/` |
| Wilayah pilot | Jakarta Timur |
| Nomor WhatsApp | Diisi user sebelum deploy; disimpan sebagai satu konstanta |

**Sengaja tidak dikerjakan:** logo (keputusan brand belum diambil — pakai wordmark teks), form waitlist, halaman marketing lain, primitive marketing generik.

---

## 3. Arsitektur route

```
src/app/
  (marketing)/
    layout.tsx            header publik + footer
    page.tsx              menyusun urutan section
    opengraph-image.tsx   OG image di-generate saat build
    _sections/
      hero.tsx
      masalah.tsx
      solusi.tsx
      cara-kerja.tsx
      kepercayaan.tsx
      harga.tsx
      faq-cta.tsx
      phone-mockup.tsx    dipakai hero
  (app)/
    dashboard/page.tsx    PINDAH dari (app)/page.tsx
```

Dua route group tidak boleh sama-sama punya `page.tsx` di akar — keduanya resolve ke `/` dan build akan gagal. **Dashboard harus dipindah lebih dulu, baru landing page ditambahkan.**

### Middleware

`src/proxy.ts` sekarang memakai logika "semua yang bukan halaman auth wajib login". Diganti menjadi daftar route publik eksplisit:

```ts
const PUBLIC_ROUTES = ["/", "/login", "/register"];
```

User yang belum login boleh mengakses route tersebut; sisanya tetap dilempar ke `/login`.

User yang **sudah** login dan membuka `/` tetap melihat landing page — tidak di-redirect. Alasannya: kalau user sedang mendemokan produk dari HP sendiri dalam keadaan login, landing page harus tetap bisa ditampilkan.

Header marketing **selalu** menampilkan tombol "Masuk" yang mengarah ke `/login`, tanpa mengecek sesi. Ini disengaja: memanggil `auth()` di layout marketing akan membuat halaman menjadi dinamis dan kehilangan pre-render — harga yang terlalu mahal untuk sekadar mengganti label tombol. Penanganannya sudah ada di `src/proxy.ts:10`, yang me-redirect user ber-sesi dari `/login` ke `/dashboard`. Jadi yang belum login mendapat halaman login, yang sudah login langsung mendarat di dashboard, dan landing page tetap sepenuhnya statis.

### Redirect yang ikut berubah

| File | Sekarang | Menjadi |
|---|---|---|
| `src/proxy.ts:10` | redirect ke `/` setelah login | `/dashboard` |
| `src/components/auth-form.tsx:33` | `router.push("/")` | `/dashboard` |
| `src/app/(app)/layout.tsx:20` | logo link `/` | `/dashboard` |
| `src/lib/actions/vehicles.ts:53` | `revalidatePath("/")` | `/dashboard` |
| `src/lib/actions/notifications.ts:78` | `revalidatePath("/", "layout")` | `/dashboard` + `"layout"` |

Baris terakhir adalah perbaikan, bukan sekadar penyesuaian: `revalidatePath("/", "layout")` membatalkan cache semua route yang berbagi root layout, termasuk landing page statis. Tanpa perbaikan ini, setiap user yang membaca notifikasi membuat landing page kehilangan status pre-render-nya.

---

## 4. Struktur halaman & copy

Tujuh section. Handoff §6 menyarankan sembilan; "Untuk siapa" dilebur ke hero dan solusi karena audiens membuka dari HP di sela kerja — setiap section tambahan adalah satu alasan menutup tab.

### 1. Hero

```
Tau nggak unit mana yang bikin Anda rugi?

Catat setoran harian per angkot, dapat pengingat KIR & STNK
otomatis, dan lihat untung bersih tiap unit tiap bulan.

[ Tanya via WhatsApp ]   [ Masuk ]
```

Di bawah tombol, baris kecil: *"Dibuat untuk pemilik angkot trayek JakLingko."*

Visual: mockup dashboard dalam frame HP. Di desktop diletakkan berdampingan; di HP ditumpuk di bawah CTA.

### 2. Masalah

Tiga kartu, bahasa lapangan:

- **Telat KIR atau STNK** — kena denda, dan angkot tidak boleh jalan. Sehari tidak jalan berarti setoran hilang.
- **Setoran dicatat di buku** — gampang lupa, gampang bocor, susah dicek ulang.
- **Tidak tahu unit mana yang boncos** — semua terlihat jalan normal, padahal ada yang nombok tiap bulan.

### 3. Solusi

Tiga fitur, ditulis sebagai manfaat:

- **Pengingat otomatis** — diberi tahu jauh hari sebelum KIR, STNK, atau servis jatuh tempo. Masuk ke HP.
- **Buku kas harian** — catat setoran dan pengeluaran per angkot. Tidak perlu hitung manual.
- **Laporan untung-rugi** — lihat untung bersih tiap unit per bulan, lengkap dengan biaya BBM dan servis.

Ketiganya sudah ada di aplikasi hari ini. Tidak boleh menjanjikan fitur yang belum dibangun (multi-tenant, dashboard koperasi, billing otomatis).

### 4. Cara kerja

Tiga langkah: daftar → masukkan data angkot → catat harian, sisanya otomatis.

### 5. Kepercayaan

Satu kalimat, tanpa metrik karangan:

> Sedang dipakai mengelola 5 unit angkot JakLingko di Jakarta Timur.

### 6. Harga

Satu kartu:

> **Gratis selama masa beta.**
> Harga akan ditentukan bersama operator yang ikut dari awal.

Kalimat kedua disengaja — mengundang percakapan willingness-to-pay yang memang sedang dicari di fase pilot.

### 7. FAQ + CTA penutup

Empat pertanyaan: data aman tidak, ribet tidak pakainya, bisa dari HP saja, butuh internet terus. Ditutup pengulangan CTA WhatsApp.

### Footer

> Trayekin adalah produk independen, tidak berafiliasi dengan JakLingko atau Pemerintah Provinsi DKI Jakarta.

Disclaimer inilah yang membuat penyebutan JakLingko di hero aman.

### Tone

Bahasa Indonesia membumi, gaya bicara ke operator. Hindari jargon startup dan teknis ("SaaS", "multi-tenant", "onboarding"). Ringkas, konkret, tegas soal manfaat.

---

## 5. Teknis

**Nomor WhatsApp.** Disimpan sebagai satu konstanta (`WHATSAPP_NUMBER`) di satu file, dipakai di tiga tempat. User mengisi sekali sebelum deploy. Link memakai format `https://wa.me/<nomor>` dengan pesan awal terisi.

**Tipografi.** Plus Jakarta Sans via `next/font/google` di `src/app/layout.tsx`. Self-hosted otomatis oleh Next — tidak ada request ke server Google. Berlaku untuk app dan landing page sekaligus.

**Metadata & OG.** `(marketing)/page.tsx` punya metadata sendiri dalam Bahasa Indonesia (title, description, `openGraph`). OG image dibuat lewat `opengraph-image.tsx` — di-generate saat build dari JSX memakai palet dan font yang sama, sehingga tidak basi ketika copy berubah.

**Logo.** Tidak dibuat. Landing page memakai wordmark teks "Trayekin" dengan font dan warna primary, sama seperti header app. `public/` masih berisi aset bawaan Next yang tidak terpakai — di luar scope, tidak disentuh.

**Perbaikan kedipan tema.** `src/components/theme-toggle.tsx:11-19` memasang class `dark` di dalam `useEffect`, jadi baru berjalan setelah JavaScript ke-load. Akibatnya user ber-dark-mode melihat halaman terang sepersekian detik sebelum berkedip gelap — paling terasa di koneksi lambat, kondisi yang persis dialami target pengguna.

Perbaikan: skrip `beforeInteractive` di root layout yang membaca `localStorage` dan memasang class `dark` sebelum halaman digambar. Sekitar 5 baris, sekaligus memperbaiki kedipan yang sama di seluruh app. Dikerjakan sebagai task terpisah agar bisa dilewati tanpa memblokir landing page.

**Performa.** Semua section adalah Server Component. Mockup HP murni HTML+CSS — nol gambar, nol JavaScript. Halaman fully static.

**Mobile-first wajib.** Dirancang dari viewport HP dulu, desktop menyusul.

---

## 6. Verifikasi

Repo tidak punya test suite. Bukti keberhasilan:

- `pnpm build` lolos (sekaligus typecheck)
- `pnpm lint` bersih
- Cek manual di viewport HP: alur login mendarat di `/dashboard`, tombol WhatsApp membuka nomor yang benar, dark mode tidak berkedip, landing page terbaca rapi di lebar 360px

**Risiko utama:** ada link ke `/` yang terlewat, sehingga user yang sudah login mendarat di landing page alih-alih dashboard. Seluruh `src/` sudah di-grep — hanya lima titik di tabel §3. Ditangkap oleh `pnpm build` dan cek manual alur login.

---

## 7. Masih terbuka

- **Nomor WhatsApp** — diisi user sebelum deploy. Sampai terisi, konstanta memakai placeholder yang jelas ditandai.
- **Brand penuh** (logo, tipografi final) — sengaja ditunda, di luar scope.
- **Harga final** — divalidasi lewat percakapan WhatsApp selama pilot.
- **Copy** — draf di §4 kemungkinan besar direvisi setelah halaman terlihat wujudnya dan setelah reaksi operator pertama.
