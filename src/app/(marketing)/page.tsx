import { Hero } from "./_sections/hero";
import { Masalah } from "./_sections/masalah";
import { Solusi } from "./_sections/solusi";
import { CaraKerja } from "./_sections/cara-kerja";
import { Kepercayaan } from "./_sections/kepercayaan";
import { Harga } from "./_sections/harga";
import { FaqCta } from "./_sections/faq-cta";

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
