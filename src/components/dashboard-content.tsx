"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatus, getStatusLabel, getStatusColor } from "@/lib/utils/status";
import { cn } from "@/lib/utils";
import { Plus, Truck, RefreshCw, AlertTriangle, TrendingDown } from "lucide-react";
import type { getVehicles } from "@/lib/actions/vehicles";
import type { BoncosRow } from "@/lib/utils/profitability";

type Vehicle = Awaited<ReturnType<typeof getVehicles>>[number];

export function DashboardContent({
  vehicles,
  boncos,
  showCronWarning,
}: {
  vehicles: Vehicle[];
  boncos: BoncosRow[];
  showCronWarning: boolean;
}) {
  const router = useRouter();

  const total = vehicles.length;
  let kirMendekati = 0;
  let serviceTerlambat = 0;
  let stnkMendekati = 0;

  vehicles.forEach((v) => {
    const latestKir = v.kirRecords[0];
    const latestService = v.serviceRecords[0];
    const latestStnk = v.stnkRecords?.[0];
    const kirStatus = latestKir ? getStatus(new Date(latestKir.endDate)) : null;
    const serviceStatus = latestService
      ? getStatus(new Date(latestService.nextServiceDate))
      : null;
    const stnkStatus = latestStnk ? getStatus(new Date(latestStnk.endDate)) : null;
    if (kirStatus === "mendekati" || kirStatus === "terlambat") kirMendekati++;
    if (serviceStatus === "terlambat") serviceTerlambat++;
    if (stnkStatus === "mendekati" || stnkStatus === "terlambat") stnkMendekati++;
  });

  return (
    <div className="space-y-6">
      {showCronWarning && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/50 dark:text-amber-300">
          <AlertTriangle className="size-4 shrink-0" />
          <span className="text-xs leading-relaxed">
            Cron check-reminders terakhir berjalan lebih dari 25 jam yang lalu / gagal. Periksa pengaturan cron.
          </span>
        </div>
      )}

      {boncos.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 dark:border-red-900/50 dark:bg-red-950/40">
          <div className="flex items-center gap-2 mb-2.5">
            <TrendingDown className="size-4 shrink-0 text-red-600 dark:text-red-400" />
            <span className="text-sm font-semibold text-red-800 dark:text-red-300">
              {boncos.length} kendaraan boncos (30 hari terakhir)
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {boncos.slice(0, 3).map((b) => (
              <Link
                key={b.vehicleId}
                href={`/vehicles/${b.vehicleId}`}
                className="flex items-center justify-between gap-2 rounded-lg bg-card/60 px-3 py-2 text-sm hover:bg-card transition-colors"
              >
                <div className="min-w-0">
                  <span className="font-semibold">{b.plate}</span>
                  {b.biggestCostDriver && (
                    <span className="text-xs text-muted-foreground ml-2">
                      biaya terbesar: {b.biggestCostDriver.label}
                    </span>
                  )}
                </div>
                <span className="shrink-0 font-semibold tabular-nums text-red-600 dark:text-red-400">
                  Rp {b.netProfit.toLocaleString("id-ID")}
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/reports"
            className="mt-2.5 inline-block text-xs font-medium text-red-700 hover:underline dark:text-red-400"
          >
            Lihat laporan lengkap →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card size="sm" className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
          <CardContent className="p-3">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total</div>
            <div className="text-2xl font-bold mt-0.5 tabular-nums">{total}</div>
          </CardContent>
        </Card>
        <Card size="sm" className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500" />
          <CardContent className="p-3">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">KIR</div>
            <div className="text-2xl font-bold mt-0.5 tabular-nums text-amber-600 dark:text-amber-400">
              {kirMendekati}
            </div>
          </CardContent>
        </Card>
        <Card size="sm" className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500" />
          <CardContent className="p-3">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Servis</div>
            <div className="text-2xl font-bold mt-0.5 tabular-nums text-red-600 dark:text-red-400">
              {serviceTerlambat}
            </div>
          </CardContent>
        </Card>
        <Card size="sm" className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500" />
          <CardContent className="p-3">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">STNK</div>
            <div className="text-2xl font-bold mt-0.5 tabular-nums text-emerald-600 dark:text-emerald-400">
              {stnkMendekati}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {stnkMendekati > 0 ? "Perlu perhatian" : "Aman"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Kendaraan Anda
          </h2>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => router.refresh()}
            title="Segarkan data"
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
        {vehicles.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
              <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Truck className="size-8 text-muted-foreground/50" />
              </div>
              <p className="font-semibold">Belum ada kendaraan.</p>
              <p className="text-sm mt-1 mb-4">Tambah kendaraan pertama Anda.</p>
              <Link href="/vehicles/new">
                <Button size="sm">
                  <Plus className="size-4" data-icon="inline-start" /> Tambah Kendaraan
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {vehicles.map((v) => {
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

      <Link href="/vehicles/new" className="fixed bottom-20 right-4 z-50">
        <Button size="icon-lg" className="rounded-2xl size-12 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
          <Plus className="size-5" />
        </Button>
      </Link>
    </div>
  );
}
