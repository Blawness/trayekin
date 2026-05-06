import { getVehicle } from "@/lib/actions/vehicles";
import { addKirRecord as addKirRecordAction } from "@/lib/actions/kir";
import { addServiceRecord as addServiceRecordAction } from "@/lib/actions/service";
import { getStatus, getStatusLabel, getStatusColor, formatDate } from "@/lib/utils/status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshButton } from "@/components/refresh-button";
import { notFound } from "next/navigation";

async function addKirRecord(formData: FormData) {
  "use server";
  await addKirRecordAction(formData);
}

async function addServiceRecord(formData: FormData) {
  "use server";
  await addServiceRecordAction(formData);
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicle(id);

  if (!vehicle) notFound();

  const latestKir = vehicle.kirRecords[0];
  const latestService = vehicle.serviceRecords[0];
  const kirStatus = latestKir
    ? getStatus(new Date(latestKir.endDate))
    : null;
  const serviceStatus = latestService
    ? getStatus(new Date(latestService.nextServiceDate))
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="sr-only">Detail Kendaraan</h1>
        <RefreshButton />
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-2xl">{vehicle.plate}</CardTitle>
          {vehicle.name && (
            <p className="text-muted-foreground">{vehicle.name}</p>
          )}
        </CardHeader>
        <CardContent className="flex gap-3">
          {kirStatus && (
            <Badge className={getStatusColor(kirStatus)}>
              KIR: {getStatusLabel(kirStatus)}{" "}
              {latestKir && `(${formatDate(new Date(latestKir.endDate))})`}
            </Badge>
          )}
          {serviceStatus && (
            <Badge className={getStatusColor(serviceStatus)}>
              Servis: {getStatusLabel(serviceStatus)}{" "}
              {latestService &&
                `(${formatDate(new Date(latestService.nextServiceDate))})`}
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-base">Catat KIR Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addKirRecord} className="flex gap-2 items-end">
            <input type="hidden" name="vehicleId" value={vehicle.id} />
            <div className="flex-1 space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai KIR</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <Button type="submit" size="sm">
              Simpan
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-base">Catat Servis Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addServiceRecord} className="space-y-3">
            <input type="hidden" name="vehicleId" value={vehicle.id} />
            <div className="space-y-2">
              <Label htmlFor="serviceDate">Tanggal Servis</Label>
              <Input
                id="serviceDate"
                name="serviceDate"
                type="date"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Jenis Servis</Label>
              <select
                id="type"
                name="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="rutin">Rutin</option>
                <option value="besar">Besar</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Input id="notes" name="notes" placeholder="Ganti oli, rem, dll." />
            </div>
            <Button type="submit" size="sm">
              Simpan
            </Button>
          </form>
        </CardContent>
      </Card>

      {vehicle.kirRecords.length > 0 && (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Riwayat KIR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vehicle.kirRecords.map((r) => (
                <div
                  key={r.id}
                  className="flex justify-between text-sm border-b pb-2"
                >
                  <span>
                    {formatDate(new Date(r.startDate))} —{" "}
                    {formatDate(new Date(r.endDate))}
                  </span>
                  <Badge
                    className={getStatusColor(getStatus(new Date(r.endDate)))}
                  >
                    {getStatusLabel(getStatus(new Date(r.endDate)))}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {vehicle.serviceRecords.length > 0 && (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Riwayat Servis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vehicle.serviceRecords.map((r) => (
                <div
                  key={r.id}
                  className="flex justify-between text-sm border-b pb-2"
                >
                  <div>
                    <div>{formatDate(new Date(r.serviceDate))}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.type} {r.notes && `— ${r.notes}`}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Berikutnya: {formatDate(new Date(r.nextServiceDate))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
