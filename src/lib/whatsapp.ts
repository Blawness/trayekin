/**
 * Nomor WhatsApp tujuan CTA landing page, format internasional tanpa "+".
 * Contoh: "6281234567890" untuk 0812-3456-7890.
 *
 * BELUM DIISI — landing page tidak boleh naik production sebelum nomor ini benar.
 */
export const WHATSAPP_NUMBER = "6281234567890";

const PESAN_DEFAULT = "Halo, saya mau tanya soal Trayekin untuk angkot saya.";

export function whatsappUrl(pesan: string = PESAN_DEFAULT): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(pesan)}`;
}
