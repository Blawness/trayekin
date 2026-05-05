import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import { auth, signOut } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="font-bold text-lg">
            Trayekin
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <span className="text-sm text-zinc-500">
              {session?.user?.name || session?.user?.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="ghost" size="sm" type="submit">
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6 pb-24">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white z-50">
        <div className="mx-auto flex max-w-2xl justify-around py-2">
          <Link href="/" className="flex flex-col items-center text-xs gap-1">
            <span className="text-lg">🏠</span>
            <span>Dashboard</span>
          </Link>
          <Link
            href="/vehicles"
            className="flex flex-col items-center text-xs gap-1"
          >
            <span className="text-lg">🚐</span>
            <span>Kendaraan</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
