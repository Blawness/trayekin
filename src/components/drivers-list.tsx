"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, Users, RefreshCw } from "lucide-react";
import type { getDrivers } from "@/lib/actions/drivers";

type Driver = Awaited<ReturnType<typeof getDrivers>>[number];

export function DriversList({ drivers }: { drivers: Driver[] }) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">Sopir</h1>
        <div className="flex gap-1.5 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.refresh()}
            title="Segarkan data"
          >
            <RefreshCw className="size-4" />
          </Button>
          <Link href="/drivers/new">
            <Button size="sm">
              <Plus className="size-4" data-icon="inline-start" /> Tambah
            </Button>
          </Link>
        </div>
      </div>

      {drivers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
            <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Users className="size-8 text-muted-foreground/50" />
            </div>
            <p className="font-semibold">Belum ada sopir.</p>
            <p className="text-sm mt-1 mb-4">Tambahkan data sopir Anda.</p>
            <Link href="/drivers/new">
              <Button size="sm">
                <Plus className="size-4" data-icon="inline-start" /> Tambah Sopir
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          {drivers.map((d) => {
            const simExpired =
              d.simExpiry && new Date(d.simExpiry) < new Date();
            return (
              <Link key={d.id} href={`/drivers/${d.id}`}>
                <Card size="sm" className="hover:bg-muted/40 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  <CardContent className="p-3.5 flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Users className="size-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate text-sm">{d.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {d.phone || "Belum ada no. HP"}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {d.simNumber && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] h-5",
                            simExpired
                              ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          )}
                        >
                          SIM: {simExpired ? "Kadaluarsa" : "Aktif"}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
