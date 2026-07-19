import { Hero } from "./_sections/hero";
import { Masalah } from "./_sections/masalah";
import { Solusi } from "./_sections/solusi";
import { CaraKerja } from "./_sections/cara-kerja";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Masalah />
      <Solusi />
      <CaraKerja />
    </>
  );
}
