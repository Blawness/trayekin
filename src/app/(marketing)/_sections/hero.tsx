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
