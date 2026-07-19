import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import { PushSubscribe } from "@/components/push-subscribe";
import { BottomNav } from "@/components/bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { auth, signOut } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-12 max-w-2xl items-center justify-between px-4">
          <Link href="/dashboard" className="font-bold text-lg tracking-tight text-primary">
            Trayekin
          </Link>
          <div className="flex items-center gap-0.5">
            <ThemeToggle />
            <NotificationBell />
            <span className="text-xs text-muted-foreground max-w-[80px] truncate hidden sm:block">
              {session?.user?.name || session?.user?.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-foreground">
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24">{children}</main>
      <BottomNav />
      <PushSubscribe />
    </div>
  );
}
