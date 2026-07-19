import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TERMASUK = [
  "Semua kendaraan Anda",
  "Pengingat KIR, STNK, dan servis",
  "Buku kas harian dan laporan untung-rugi",
];

export function Harga() {
  return (
    <section className="border-t bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Harga</h2>

        <Card className="mt-6 max-w-md">
          <CardContent className="space-y-4 pt-6">
            <p className="text-2xl font-extrabold text-primary">
              Gratis selama masa beta.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Harga akan ditentukan bersama operator yang ikut dari awal.
            </p>

            <ul className="space-y-2 border-t pt-4">
              {TERMASUK.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
