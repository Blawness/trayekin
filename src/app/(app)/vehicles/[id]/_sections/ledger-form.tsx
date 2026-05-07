import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { getDrivers } from "@/lib/actions/drivers";

type Driver = Awaited<ReturnType<typeof getDrivers>>[number];

type Props = {
  vehicleId: string;
  drivers: Driver[];
  action: (formData: FormData) => void;
};

export function LedgerFormSection({ vehicleId, drivers, action }: Props) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">Catat Setoran Harian</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          <input type="hidden" name="vehicleId" value={vehicleId} />
          <div className="space-y-2">
            <Label htmlFor="ledgerDate">Tanggal</Label>
            <Input id="ledgerDate" name="date" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="driverId">Sopir</Label>
            <select
              id="driverId"
              name="driverId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">-- Pilih sopir --</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="revenue">Pendapatan (Rp)</Label>
              <Input id="revenue" name="revenue" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenses">Pengeluaran (Rp)</Label>
              <Input id="expenses" name="expenses" type="number" placeholder="0" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ledgerNotes">Catatan</Label>
            <Input id="ledgerNotes" name="notes" placeholder="Supir, BBM, parkir..." />
          </div>
          <Button type="submit" size="sm">
            Simpan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
