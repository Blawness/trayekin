import { BellRing, NotebookPen, Wallet } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const SOLUSI = [
  {
    Ikon: BellRing,
    judul: "Pengingat otomatis",
    isi: "Diberi tahu jauh hari sebelum KIR, STNK, atau servis jatuh tempo. Masuk langsung ke HP Anda, tidak perlu ingat sendiri.",
    aksen: "from-[oklch(0.7_0.16_250)] to-[oklch(0.72_0.16_250)]",
  },
  {
    Ikon: NotebookPen,
    judul: "Buku kas harian",
    isi: "Catat setoran dan pengeluaran per angkot setiap hari. Rapi, bisa dicek ulang kapan saja, dan tanpa hitung manual.",
    aksen: "from-[oklch(0.78_0.15_200)] to-[oklch(0.75_0.16_155)]",
  },
  {
    Ikon: Wallet,
    judul: "Laporan untung-rugi",
    isi: "Lihat untung bersih tiap unit per bulan, lengkap dengan biaya BBM dan servis. Tahun mana unit yang boncos, langsung kelihatan.",
    aksen: "from-[oklch(0.75_0.16_155)] to-[oklch(0.72_0.16_250)]",
  },
];

export function Solusi() {
  return (
    <section id="fitur" className="relative scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-[oklch(0.78_0.15_200)] uppercase">
            Semua di satu tempat
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Pencatatan jalan sendiri, Anda tinggal cek.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Dibuat untuk pemilik unit yang pegang sendiri operasionalnya, juga
            untuk pengurus koperasi yang mengawasi beberapa unit sekaligus.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SOLUSI.map(({ Ikon, judul, isi, aksen }, i) => (
            <Reveal key={judul} delay={i * 110}>
              <article className="mkt-card group h-full rounded-2xl border border-border/70 bg-card/50 p-6 backdrop-blur">
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${aksen} text-white shadow-lg`}
                >
                  <Ikon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{judul}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {isi}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
