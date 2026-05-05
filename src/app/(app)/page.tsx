import { getVehicles } from "@/lib/actions/vehicles";
import { getStatus, getStatusLabel, getStatusColor, formatDate } from "@/lib/utils/status";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const vehicleList = await getVehicles();

  let total = vehicleList.length;
  let kirMendekati = 0;
  let serviceTerlambat = 0;

  vehicleList.forEach((v) => {
    const latestKir = v.kirRecords[0];
    const latestService = v.serviceRecords[0];
    const kirStatus = latestKir ? getStatus(new Date(latestKir.endDate)) : null;
    const serviceStatus = latestService
      ? getStatus(new Date(latestService.nextServiceDate))
      : null;
    if (kirStatus === "mendekati" || kirStatus === "terlambat") kirMendekati++;
    if (serviceStatus === "terlambat") serviceTerlambat++;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-3">
            <div className="text-xs text-zinc-500">Total</div>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-3">
            <div className="text-xs text-zinc-500">KIR Mendekati</div>
            <div className="text-2xl font-bold text-yellow-600">
              {kirMendekati}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-3">
            <div className="text-xs text-zinc-500">Servis Telat</div>
            <div className="text-2xl font-bold text-red-600">
              {serviceTerlambat}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="font-semibold text-sm text-zinc-500 mb-3">
          KENDARAAN ANDA
        </h2>
        {vehicleList.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <p className="text-4xl mb-2">🚐</p>
            <p>Belum ada kendaraan.</p>
            <p className="text-sm">Tambah kendaraan pertama Anda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vehicleList.map((v) => {
              const latestKir = v.kirRecords[0];
              const latestService = v.serviceRecords[0];
              const kirStatus = latestKir
                ? getStatus(new Date(latestKir.endDate))
                : null;
              const serviceStatus = latestService
                ? getStatus(new Date(latestService.nextServiceDate))
                : null;

              return (
                <Link key={v.id} href={`/vehicles/${v.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="text-2xl">🚐</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{v.plate}</div>
                        <div className="text-sm text-zinc-500 truncate">
                          {v.name || "Tanpa nama"}
                        </div>
                      </div>
                      <div className="flex gap-2 text-right">
                        <div>
                          <div className="text-[10px] text-zinc-400">KIR</div>
                          {kirStatus ? (
                            <Badge
                              variant="secondary"
                              className={getStatusColor(kirStatus)}
                            >
                              {getStatusLabel(kirStatus)}
                            </Badge>
                          ) : (
                            <span className="text-xs text-zinc-400">-</span>
                          )}
                          {latestKir && (
                            <div className="text-[10px] text-zinc-400 mt-0.5">
                              {formatDate(new Date(latestKir.endDate))}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-400">Servis</div>
                          {serviceStatus ? (
                            <Badge
                              variant="secondary"
                              className={getStatusColor(serviceStatus)}
                            >
                              {getStatusLabel(serviceStatus)}
                            </Badge>
                          ) : (
                            <span className="text-xs text-zinc-400">-</span>
                          )}
                          {latestService && (
                            <div className="text-[10px] text-zinc-400 mt-0.5">
                              {formatDate(
                                new Date(latestService.nextServiceDate)
                              )}
                            </div>
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
        <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
          <Plus />
        </Button>
      </Link>
    </div>
  );
}
