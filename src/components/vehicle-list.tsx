"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        <h1 className="text-xl font-bold shrink-0">Kendaraan</h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.refresh()}
            title="Segarkan data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/vehicles/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Tambah
            </Button>
          </Link>
        </div>
      </div>

      {initialVehicles.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nomor polisi atau nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {initialVehicles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Truck className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="font-medium">Belum ada kendaraan.</p>
          <p className="text-sm mt-1 mb-4">Tambahkan kendaraan pertama Anda.</p>
          <Link href="/vehicles/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Tambah Kendaraan
            </Button>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
          <p>Tidak ada kendaraan yang cocok.</p>
          <p className="text-sm mt-1">Coba kata kunci lain.</p>
        </div>
      ) : (
        <div className="space-y-3">
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
                <Card className="hover:shadow-md transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="text-muted-foreground">
                      <Truck className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{v.plate}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {v.name || "Tanpa nama"}
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {kirStatus && (
                        <Badge
                          variant="secondary"
                          className={getStatusColor(kirStatus)}
                        >
                          KIR: {getStatusLabel(kirStatus)}
                        </Badge>
                      )}
                      {stnkStatus && (
                        <Badge
                          variant="secondary"
                          className={getStatusColor(stnkStatus)}
                        >
                          STNK: {getStatusLabel(stnkStatus)}
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
