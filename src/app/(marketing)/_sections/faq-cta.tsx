import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/whatsapp";

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
    <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Pertanyaan yang sering ditanya
      </h2>

      <dl className="mt-8 grid gap-6 sm:grid-cols-2">
        {FAQ.map(({ tanya, jawab }) => (
          <div key={tanya} className="space-y-1.5">
            <dt className="font-semibold">{tanya}</dt>
            <dd className="text-sm leading-relaxed text-muted-foreground">{jawab}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 rounded-xl border bg-card p-6 text-center sm:p-10">
        <h3 className="text-xl font-bold text-balance sm:text-2xl">
          Mau coba untuk angkot Anda?
        </h3>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Chat langsung, nanti dibantu daftar dan memasukkan data angkot pertama.
        </p>
        <Button
          render={
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" />
          }
          nativeButton={false}
          size="lg"
          className="mt-6 gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Tanya via WhatsApp
        </Button>
      </div>
    </section>
  );
}
