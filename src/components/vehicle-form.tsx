"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/toast";

export function VehicleForm({
  action,
}: {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      toast(result.error, "error");
    } else {
      toast("Kendaraan berhasil disimpan.", "success");
      router.push("/");
      router.refresh();
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Kendaraan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plate">Nomor Polisi *</Label>
            <Input id="plate" name="plate" placeholder="B 1234 XYZ" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nama / Jenis Kendaraan</Label>
            <Input id="name" name="name" placeholder="Toyota Hiace — Angkot 03" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KIR Terakhir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="kir_start_date">Tanggal Mulai Berlaku KIR</Label>
          <Input id="kir_start_date" name="kir_start_date" type="date" />
          <p className="text-xs text-zinc-400">
            Tanggal kadaluarsa dihitung otomatis +6 bulan.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Servis Terakhir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="service_date">Tanggal Servis Terakhir</Label>
          <Input id="service_date" name="service_date" type="date" />
          <p className="text-xs text-zinc-400">
            Servis berikutnya dihitung otomatis +3 bulan.
          </p>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan Kendaraan"}
      </Button>
    </form>
  );
}
