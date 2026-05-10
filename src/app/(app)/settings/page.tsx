import { getAppSettings, updateAppSettings } from "@/lib/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SettingsPage() {
  const settings = await getAppSettings();
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const ratePerKm = settingsMap["rate_per_km"] || "4500";
  const fuelPrice = settingsMap["fuel_price_per_liter"] || "10000";
  const fuelConsumption = settingsMap["fuel_consumption_km_per_l"] || "10";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Pengaturan</h1>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-base">Biaya Transjakarta</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={async (formData) => { await updateAppSettings(formData); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rate_per_km">Tarif per KM (Rp)</Label>
              <Input
                id="rate_per_km"
                name="rate_per_km"
                type="number"
                defaultValue={ratePerKm}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_price_per_liter">Harga BBM per Liter (Rp)</Label>
              <Input
                id="fuel_price_per_liter"
                name="fuel_price_per_liter"
                type="number"
                defaultValue={fuelPrice}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_consumption_km_per_l">Konsumsi BBM (km/liter)</Label>
              <Input
                id="fuel_consumption_km_per_l"
                name="fuel_consumption_km_per_l"
                type="number"
                defaultValue={fuelConsumption}
                required
              />
            </div>

            <Button type="submit">Simpan</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
