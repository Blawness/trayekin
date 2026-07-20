import { MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/whatsapp";
import { Reveal } from "@/components/marketing/reveal";

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
    <section id="faq" className="relative scroll-mt-20">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Pertanyaan yang sering ditanya
          </h2>
        </Reveal>

        <div className="mt-10 space-y-3">
          {FAQ.map(({ tanya, jawab }) => (
            <Reveal key={tanya}>
              <details className="mkt-accordion group rounded-2xl border border-border/70 bg-card/40 px-5 backdrop-blur">
                <summary className="flex items-center justify-between gap-4 py-4 text-left text-base font-semibold">
                  {tanya}
                  <ChevronDown className="mkt-accordion-icon h-5 w-5 shrink-0 text-muted-foreground" />
                </summary>
                <div className="mkt-accordion-body">
                  <div>
                    <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                      {jawab}
                    </p>
                  </div>
                </div>
              </details>
            </Reveal>
          ))}
        </div>

        {/* Final CTA */}
        <Reveal className="relative mt-16 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-[oklch(0.7_0.16_250/0.25)] to-[oklch(0.78_0.15_200/0.2)] px-6 py-12 text-center sm:px-12">
          <div className="mkt-glow left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 bg-[oklch(0.72_0.16_250/0.5)]" />
          <div className="relative">
            <h3 className="text-2xl font-extrabold text-balance sm:text-3xl">
              Mau coba untuk angkot Anda?
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Chat langsung, nanti dibantu daftar dan memasukkan data angkot
              pertama.
            </p>
            <Button
              render={
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" />
              }
              nativeButton={false}
              size="lg"
              className="mt-7 gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Tanya via WhatsApp
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
