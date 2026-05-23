"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatus, getStatusLabel, getStatusColor } from "@/lib/utils/status";
import { Plus, Truck, RefreshCw, AlertTriangle } from "lucide-react";
import type { getVehicles } from "@/lib/actions/vehicles";

type Vehicle = Awaited<ReturnType<typeof getVehicles>>[number];

export function DashboardContent({
  vehicles,
  showCronWarning,
}: {
  vehicles: Vehicle[];
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
        <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Peringatan: Cron check-reminders terakhir berjalan lebih dari 25 jam
            yang lalu / gagal. Periksa pengaturan cron.
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">KIR Mendekati</div>
            <div className="text-2xl font-bold text-yellow-600">
              {kirMendekati}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Servis Telat</div>
            <div className="text-2xl font-bold text-red-600">
              {serviceTerlambat}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">STNK</div>
            <div className="text-2xl font-bold text-green-600">
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
          <h2 className="font-semibold text-sm text-muted-foreground">
            KENDARAAN ANDA
          </h2>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => router.refresh()}
            title="Segarkan data"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
        {vehicles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Truck className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">Belum ada kendaraan.</p>
            <p className="text-sm mt-1 mb-4">Tambah kendaraan pertama Anda.</p>
            <Link href="/vehicles/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Tambah Kendaraan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
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
                      <div className="flex gap-1.5 text-right shrink-0">
                        <div>
                          <div className="text-[10px] text-muted-foreground">
                            KIR
                          </div>
                          {kirStatus ? (
                            <Badge
                              variant="secondary"
                              className={getStatusColor(kirStatus)}
                            >
                              {getStatusLabel(kirStatus)}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground">STNK</div>
                          {stnkStatus ? (
                            <Badge
                              variant="secondary"
                              className={getStatusColor(stnkStatus)}
                            >
                              {getStatusLabel(stnkStatus)}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
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
        <Button size="lg" className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow">
          <Plus />
        </Button>
      </Link>
    </div>
  );
}
