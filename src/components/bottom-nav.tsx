"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Truck, BarChart3 } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="mx-auto flex max-w-2xl justify-around py-2">
        <Link
          href="/"
          className={`flex flex-col items-center text-xs gap-1 transition-colors ${
            pathname === "/" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <House className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/vehicles"
          className={`flex flex-col items-center text-xs gap-1 transition-colors ${
            pathname.startsWith("/vehicles")
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          <Truck className="h-5 w-5" />
          <span>Kendaraan</span>
        </Link>
        <Link
          href="/reports"
          className={`flex flex-col items-center text-xs gap-1 transition-colors ${
            pathname.startsWith("/reports")
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          <span>Laporan</span>
        </Link>
      </div>
    </nav>
  );
}
