"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, RefreshCw } from "lucide-react";
import type { getDrivers } from "@/lib/actions/drivers";

type Driver = Awaited<ReturnType<typeof getDrivers>>[number];

export function DriversList({ drivers }: { drivers: Driver[] }) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Sopir</h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.refresh()}
            title="Segarkan data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/drivers/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Tambah
            </Button>
          </Link>
        </div>
      </div>

      {drivers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="font-medium">Belum ada sopir.</p>
          <p className="text-sm mt-1 mb-4">Tambahkan data sopir Anda.</p>
          <Link href="/drivers/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Tambah Sopir
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {drivers.map((d) => {
            const simExpired =
              d.simExpiry && new Date(d.simExpiry) < new Date();
            return (
              <Link key={d.id} href={`/drivers/${d.id}`}>
                <Card className="hover:shadow-md transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{d.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {d.phone || "Belum ada no. HP"}
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {d.simNumber && (
                        <Badge
                          variant="secondary"
                          className={
                            simExpired
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }
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
