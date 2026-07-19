import { Hero } from "./_sections/hero";
import { Masalah } from "./_sections/masalah";
import { Solusi } from "./_sections/solusi";
import { CaraKerja } from "./_sections/cara-kerja";
import { Kepercayaan } from "./_sections/kepercayaan";
import { Harga } from "./_sections/harga";
import { FaqCta } from "./_sections/faq-cta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trayekin — Kelola angkot dari HP",
  description:
    "Catat setoran harian per angkot, dapat pengingat KIR & STNK otomatis, dan lihat untung bersih tiap unit. Dibuat untuk pemilik angkot trayek JakLingko.",
  openGraph: {
    title: "Trayekin — Kelola angkot dari HP",
    description:
      "Pengingat KIR & STNK otomatis plus buku kas harian per angkot. Gratis selama masa beta.",
    locale: "id_ID",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Masalah />
      <Solusi />
      <CaraKerja />
      <Kepercayaan />
      <Harga />
      <FaqCta />
    </>
  );
}
