const LANGKAH = [
  {
    judul: "Daftar",
    isi: "Buat akun pakai email. Gratis, tidak perlu kartu kredit.",
  },
  {
    judul: "Masukkan data angkot",
    isi: "Isi plat nomor dan tanggal KIR serta STNK terakhir. Cukup sekali di awal.",
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
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
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
