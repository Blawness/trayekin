import { BookX, TrendingDown, TriangleAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const MASALAH = [
  {
    Ikon: TriangleAlert,
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
    <section className="border-t bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          Ngurus angkot itu ribet kalau semuanya diingat sendiri
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {MASALAH.map(({ Ikon, judul, isi }) => (
            <Card key={judul}>
              <CardContent className="space-y-2 pt-6">
                <Ikon className="h-6 w-6 text-destructive" />
                <h3 className="font-semibold">{judul}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{isi}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
