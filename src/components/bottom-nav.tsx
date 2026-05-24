"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Truck, Users, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dasbor", icon: House, exact: true },
  { href: "/vehicles", label: "Angkot", icon: Truck },
  { href: "/drivers", label: "Sopir", icon: Users },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/settings", label: "Atur", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="mx-auto flex max-w-2xl justify-around py-1.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-[11px] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute inset-0 rounded-xl bg-primary/10" />
              )}
              <Icon className="relative size-5" />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
