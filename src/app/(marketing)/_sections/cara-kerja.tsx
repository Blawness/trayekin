import { Reveal } from "@/components/marketing/reveal";

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
    <section id="cara-kerja" className="relative scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-[oklch(0.78_0.15_200)] uppercase">
            Cuma tiga langkah
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Dari nol sampai otomatis dalam satu hari.
          </h2>
        </Reveal>

        <Reveal className="relative mt-14">
          {/* animated connector */}
          <div
            className="mkt-draw-line absolute left-[17px] top-3 bottom-3 w-0.5 rounded-full bg-gradient-to-b from-[oklch(0.78_0.15_200)] via-[oklch(0.72_0.16_250)] to-transparent"
            style={{ ["--d" as string]: "200ms" } as React.CSSProperties}
          />

          <ol className="space-y-8">
            {LANGKAH.map(({ judul, isi }, i) => (
              <Reveal as="li" key={judul} delay={i * 160} className="relative flex gap-5">
                <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[oklch(0.78_0.15_200/0.5)] bg-background text-sm font-bold text-[oklch(0.82_0.14_200)]">
                  {i + 1}
                </span>
                <div className="mkt-card flex-1 rounded-2xl border border-border/70 bg-card/40 p-5">
                  <h3 className="text-lg font-semibold">{judul}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {isi}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
