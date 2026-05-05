import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trayekin — Pengingat KIR & Servis",
  description: "Kelola KIR dan servis kendaraan operasional Anda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
