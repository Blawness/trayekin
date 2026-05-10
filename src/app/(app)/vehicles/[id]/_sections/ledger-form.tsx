"use client";

import { useState } from "react";
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
  ratePerKm: number;
};

export function LedgerFormSection({ vehicleId, drivers, action, ratePerKm }: Props) {
  const [km, setKm] = useState("");
  const [manualRevenue, setManualRevenue] = useState("");
  const autoRevenue = km ? parseInt(km, 10) * ratePerKm : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">Catat Setoran Harian</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          <input type="hidden" name="vehicleId" value={vehicleId} />
          <input type="hidden" name="km" value={km} />
          <input type="hidden" name="revenue" value={autoRevenue ?? manualRevenue} />
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
          <div className="space-y-2">
            <Label htmlFor="km">KM Tempuh</Label>
            <Input
              id="km"
              name="km_input"
              type="number"
              placeholder="Kosongkan jika input manual"
              value={km}
              onChange={(e) => setKm(e.target.value)}
            />
          </div>
          {autoRevenue !== null && (
            <div className="text-sm text-muted-foreground">
              Pendapatan: Rp {autoRevenue.toLocaleString("id-ID")} ({km} km × Rp {ratePerKm.toLocaleString("id-ID")}/km)
            </div>
          )}
          {autoRevenue === null && (
            <div className="space-y-2">
              <Label htmlFor="manualRevenue">Pendapatan (Rp)</Label>
              <Input
                id="manualRevenue"
                type="number"
                placeholder="0"
                value={manualRevenue}
                onChange={(e) => setManualRevenue(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="expenses">Pengeluaran (Rp)</Label>
            <Input id="expenses" name="expenses" type="number" placeholder="0" />
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
