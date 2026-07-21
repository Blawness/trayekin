import { Gauge, Smartphone, Timer, ShieldCheck } from "lucide-react";
import { Counter } from "@/components/marketing/counter";
import { Reveal } from "@/components/marketing/reveal";

const STATS = [
  {
    Ikon: Gauge,
    nilai: 5,
    suffix: "+",
    label: "Unit angkot diawasi",
  },
  {
    Ikon: Smartphone,
    nilai: 100,
    suffix: "%",
    label: "Diakses langsung dari HP",
  },
  {
    Ikon: Timer,
    nilai: 12,
    suffix: " hari",
    label: "Peringatan dikirim sebelum jatuh tempo",
  },
  {
    Ikon: ShieldCheck,
    nilai: 0,
    suffix: "",
    label: "kali lupa jadwal servis sejak pakai pengingat",
  },
];

export function Kepercayaan() {
  return (
    <section className="relative scroll-mt-20 border-y border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-[oklch(0.78_0.15_200)] uppercase">
            Di lapangan
          </p>
          <p className="mt-3 text-2xl font-bold text-balance sm:text-3xl">
            Sudah dipakai mengelola armada angkot di Jakarta Timur.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/60 lg:grid-cols-4">
          {STATS.map(({ Ikon, nilai, suffix, label }, i) => (
            <Reveal
              key={label}
              delay={i * 100}
              className="flex flex-col items-center gap-2 bg-background/70 p-6 text-center"
            >
              <Ikon className="h-5 w-5 text-[oklch(0.78_0.15_200)]" />
              <Counter
                value={nilai}
                suffix={suffix}
                className="text-3xl font-extrabold tracking-tight sm:text-4xl"
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                {label}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
