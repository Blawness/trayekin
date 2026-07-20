import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/whatsapp";
import { Reveal } from "@/components/marketing/reveal";

const TERMASUK = [
  "Semua kendaraan Anda",
  "Pengingat KIR, STNK, dan servis",
  "Buku kas harian dan laporan untung-rugi",
  "Akses penuh dari HP dan web",
];

export function Harga() {
  return (
    <section id="harga" className="relative scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-[oklch(0.78_0.15_200)] uppercase">
            Harga
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Gratis selama masa beta.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Harga final akan ditentukan bersama operator yang ikut dari awal —
            tanpa kejutan di tengah jalan.
          </p>
        </Reveal>

        <Reveal className="relative mx-auto mt-12 max-w-md">
          <div className="mkt-glow left-1/2 top-0 h-48 w-48 -translate-x-1/2 bg-[oklch(0.7_0.16_250/0.4)]" />
          <div className="mkt-card relative overflow-hidden rounded-3xl border border-border/70 bg-card/60 p-8 backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.78_0.15_200)] to-transparent" />
            <p className="text-4xl font-extrabold tracking-tight text-[oklch(0.82_0.14_200)]">
              Rp 0
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              per bulan, selama masa beta.
            </p>

            <ul className="mt-6 space-y-3 border-t border-border/60 pt-6">
              {TERMASUK.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[oklch(0.75_0.16_155/0.15)] text-[oklch(0.78_0.16_155)]">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Button
              render={
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" />
              }
              nativeButton={false}
              size="lg"
              className="mt-8 w-full gap-2"
            >
              Gabung Masa Beta
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
