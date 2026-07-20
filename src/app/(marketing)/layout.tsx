import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/marketing/logo";
import "./marketing.css";

const NAV = [
  { href: "#fitur", label: "Fitur" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#harga", label: "Harga" },
  { href: "#faq", label: "FAQ" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark mkt-root min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Trayekin beranda">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              render={<Link href="/login" />}
              nativeButton={false}
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Masuk
            </Button>
            <Button
              render={<Link href="/register" />}
              nativeButton={false}
              size="sm"
              className="gap-1.5"
            >
              Daftar Gratis
            </Button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="relative overflow-hidden border-t border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Satu dashboard untuk mengelola KIR, STNK, servis, dan untung
              bersih tiap angkot. Dibuat untuk operator trayek Indonesia.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-semibold text-foreground">Produk</p>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-semibold text-foreground">Perusahaan</p>
            <span className="block text-muted-foreground">Tentang</span>
            <span className="block text-muted-foreground">Kontak</span>
            <span className="block text-muted-foreground">Kebijakan Privasi</span>
          </div>
        </div>

        <div className="border-t border-border/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              &copy; {new Date().getFullYear()} Trayekin. Seluruh hak cipta
              dilindungi.
            </p>
            <p className="max-w-md">
              Produk independen, tidak berafiliasi dengan JakLingko atau
              Pemerintah Provinsi DKI Jakarta.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
