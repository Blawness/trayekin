import { BellRing, NotebookPen, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SOLUSI = [
  {
    Ikon: BellRing,
    judul: "Pengingat otomatis",
    isi: "Diberi tahu jauh hari sebelum KIR, STNK, atau servis jatuh tempo. Masuk langsung ke HP Anda.",
  },
  {
    Ikon: NotebookPen,
    judul: "Buku kas harian",
    isi: "Catat setoran dan pengeluaran per angkot setiap hari. Tidak perlu hitung manual lagi.",
  },
  {
    Ikon: Wallet,
    judul: "Laporan untung-rugi",
    isi: "Lihat untung bersih tiap unit per bulan, lengkap dengan biaya BBM dan servis.",
  },
];

export function Solusi() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
        Semua dicatat di satu tempat, pengingatnya jalan sendiri
      </h2>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Dibuat untuk pemilik unit yang pegang sendiri operasionalnya, juga untuk
        pengurus koperasi yang mengawasi beberapa unit sekaligus.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {SOLUSI.map(({ Ikon, judul, isi }) => (
          <Card key={judul}>
            <CardContent className="space-y-2 pt-6">
              <Ikon className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">{judul}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{isi}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
