import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  vehicleId: string;
  action: (formData: FormData) => void;
};

export function PartFormSection({ vehicleId, action }: Props) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">Catat Ganti Suku Cadang</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          <input type="hidden" name="vehicleId" value={vehicleId} />
          <div className="space-y-2">
            <Label htmlFor="partName">Nama Suku Cadang *</Label>
            <Input id="partName" name="partName" placeholder="Kampas rem, ban, aki..." required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="partDate">Tanggal Ganti</Label>
              <Input id="partDate" name="date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Biaya (Rp)</Label>
              <Input id="cost" name="cost" type="number" placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="odometer">Kilometer</Label>
              <Input id="odometer" name="odometer" type="number" placeholder="KM" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lifespanMonths">Umur Pakai (bulan)</Label>
              <Input id="lifespanMonths" name="lifespanMonths" type="number" placeholder="Contoh: 6" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="partNotes">Catatan</Label>
            <Input id="partNotes" name="notes" placeholder="Merk, toko..." />
          </div>
          <Button type="submit" size="sm">Simpan</Button>
        </form>
      </CardContent>
    </Card>
  );
}
