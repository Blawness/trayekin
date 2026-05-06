import { getVehicles } from "@/lib/actions/vehicles";
import { getStatus, getStatusLabel, getStatusColor } from "@/lib/utils/status";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Truck } from "lucide-react";

export default async function VehiclesPage() {
  const vehicleList = await getVehicles();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Kendaraan</h1>
        <Link href="/vehicles/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Tambah
          </Button>
        </Link>
      </div>

      {vehicleList.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <Truck className="h-10 w-10 mx-auto mb-2 text-zinc-300" />
          <p>Belum ada kendaraan.</p>
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
                    <div className="text-muted-foreground">
                      <Truck className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{v.plate}</div>
                      <div className="text-sm text-zinc-500">
                        {v.name || "Tanpa nama"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {kirStatus && (
                        <Badge
                          variant="secondary"
                          className={getStatusColor(kirStatus)}
                        >
                          KIR: {getStatusLabel(kirStatus)}
                        </Badge>
                      )}
                      {serviceStatus && (
                        <Badge
                          variant="secondary"
                          className={getStatusColor(serviceStatus)}
                        >
                          Servis: {getStatusLabel(serviceStatus)}
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
