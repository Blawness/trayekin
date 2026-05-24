"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatus, getStatusLabel, getStatusColor } from "@/lib/utils/status";
import { Plus, Truck, RefreshCw, Search } from "lucide-react";
import type { getVehicles } from "@/lib/actions/vehicles";

type Vehicle = Awaited<ReturnType<typeof getVehicles>>[number];

export function VehicleList({
  vehicles: initialVehicles,
}: {
  vehicles: Vehicle[];
}) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = initialVehicles.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.plate.toLowerCase().includes(q) ||
      (v.name && v.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-2">
        <h1 className="text-xl font-bold tracking-tight">Kendaraan</h1>
        <div className="flex gap-1.5 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.refresh()}
            title="Segarkan data"
          >
            <RefreshCw className="size-4" />
          </Button>
          <Link href="/vehicles/new">
            <Button size="sm">
              <Plus className="size-4" data-icon="inline-start" /> Tambah
            </Button>
          </Link>
        </div>
      </div>

      {initialVehicles.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nomor polisi atau nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
      )}

      {initialVehicles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
            <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Truck className="size-8 text-muted-foreground/50" />
            </div>
            <p className="font-semibold">Belum ada kendaraan.</p>
            <p className="text-sm mt-1 mb-4">Tambahkan kendaraan pertama Anda.</p>
            <Link href="/vehicles/new">
              <Button size="sm">
                <Plus className="size-4" data-icon="inline-start" /> Tambah Kendaraan
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
            <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Search className="size-8 text-muted-foreground/50" />
            </div>
            <p className="font-semibold">Tidak ada kendaraan yang cocok.</p>
            <p className="text-sm mt-1">Coba kata kunci lain.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((v) => {
            const latestKir = v.kirRecords[0];
            const latestStnk = v.stnkRecords?.[0];
            const kirStatus = latestKir
              ? getStatus(new Date(latestKir.endDate))
              : null;
            const stnkStatus = latestStnk
              ? getStatus(new Date(latestStnk.endDate))
              : null;

            return (
              <Link key={v.id} href={`/vehicles/${v.id}`}>
                <Card size="sm" className="hover:bg-muted/40 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  <CardContent className="p-3.5 flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Truck className="size-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate text-sm">{v.plate}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {v.name || "Tanpa nama"}
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {kirStatus ? (
                        <Badge variant="secondary" className={cn("text-[10px] h-5", getStatusColor(kirStatus))}>
                          {getStatusLabel(kirStatus)}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">KIR: -</span>
                      )}
                      {stnkStatus ? (
                        <Badge variant="secondary" className={cn("text-[10px] h-5", getStatusColor(stnkStatus))}>
                          {getStatusLabel(stnkStatus)}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">STNK: -</span>
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
