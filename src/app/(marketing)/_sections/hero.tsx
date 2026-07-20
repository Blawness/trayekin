import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/whatsapp";
import { PhoneMockup } from "./phone-mockup";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="mkt-aurora mkt-aurora--a" />
        <div className="mkt-aurora mkt-aurora--b" />
        <div className="mkt-aurora mkt-aurora--c" />
        <div className="mkt-grid absolute inset-0" />
        <div className="mkt-grain absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Copy */}
          <div className="space-y-7">
            <div
              className="mkt-rise inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
              style={{ ["--d" as string]: "60ms" } as React.CSSProperties}
            >
              <Sparkles className="h-3.5 w-3.5 text-[oklch(0.78_0.15_200)]" />
              Pencatatan KIR &amp; armada otomatis
            </div>

            <h1
              className="mkt-rise text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl"
              style={{ ["--d" as string]: "0ms" } as React.CSSProperties}
            >
              Kendalikan setiap angkot,{" "}
              <span className="mkt-gradient-text">dari satu dashboard</span>.
            </h1>

            <p
              className="mkt-rise max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
              style={{ ["--d" as string]: "240ms" } as React.CSSProperties}
            >
              Dapat pengingat KIR, STNK, dan servis otomatis. Catat setoran
              harian, lalu lihat untung bersih tiap unit bulan ini — tanpa
              hitung manual, tanpa angkot yang tiba-tiba tidak boleh jalan.
            </p>

            <div
              className="mkt-rise flex flex-col gap-3 sm:flex-row"
              style={{ ["--d" as string]: "340ms" } as React.CSSProperties}
            >
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
                render={<Link href="/register" />}
                nativeButton={false}
                size="lg"
                variant="outline"
                className="gap-2"
              >
                Daftar Gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div
              className="mkt-rise flex items-center gap-2 text-sm text-muted-foreground"
              style={{ ["--d" as string]: "440ms" } as React.CSSProperties}
            >
              <ShieldCheck className="h-4 w-4 text-[oklch(0.75_0.16_155)]" />
              Data hanya bisa dibuka dengan akun Anda. Gratis selama masa beta.
            </div>
          </div>

          {/* Visual */}
          <div
            className="mkt-rise relative flex justify-center lg:justify-end"
            style={{ ["--d" as string]: "300ms" } as React.CSSProperties}
          >
            <div className="mkt-glow h-72 w-72 bg-[oklch(0.7_0.16_250/0.45)]" />
            <div className="mkt-float relative">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
