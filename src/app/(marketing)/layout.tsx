import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="font-bold text-lg tracking-tight text-primary">
            Trayekin
          </Link>
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            variant="ghost"
            size="sm"
          >
            Masuk
          </Button>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-5xl space-y-3 px-4 py-8 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Trayekin</p>
          <p>
            Trayekin adalah produk independen, tidak berafiliasi dengan JakLingko
            atau Pemerintah Provinsi DKI Jakarta.
          </p>
          <p>&copy; {new Date().getFullYear()} Trayekin</p>
        </div>
      </footer>
    </div>
  );
}
