"use client";

import { useState } from "react";
import { updateAppSettings } from "@/lib/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  ratePerKm: string;
  fuelPrice: string;
  fuelConsumption: string;
};

export function SettingsForm({ ratePerKm, fuelPrice, fuelConsumption }: Props) {
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await updateAppSettings(formData);
    if (result?.success) {
      setStatus("success");
      setTimeout(() => setStatus(null), 3000);
    } else if (result?.error) {
      setStatus("error");
    }
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-base">Biaya Operasional</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {status === "success" && (
            <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Pengaturan berhasil disimpan.</div>
          )}
          {status === "error" && (
            <div className="text-sm text-destructive font-medium">Gagal menyimpan pengaturan.</div>
          )}
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
  );
}
