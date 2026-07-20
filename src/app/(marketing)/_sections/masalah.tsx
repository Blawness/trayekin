import { BookX, Timer, TrendingDown } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const MASALAH = [
  {
    Ikon: Timer,
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
    <section className="relative scroll-mt-20 border-y border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-[oklch(0.7_0.18_25)] uppercase">
            Sebelum pakai Trayekin
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Ngurus angkot ribet kalau semuanya diingat sendiri.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {MASALAH.map(({ Ikon, judul, isi }, i) => (
            <Reveal key={judul} delay={i * 110}>
              <div className="mkt-card h-full rounded-2xl border border-border/70 bg-background/40 p-6">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[oklch(0.6_0.18_25/0.4)] bg-[oklch(0.6_0.18_25/0.12)] text-[oklch(0.7_0.18_25)]">
                  <Ikon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{judul}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {isi}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
