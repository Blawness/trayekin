"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DriverForm({
  action,
  mode = "create",
  defaultValues,
}: {
  action: (
    formData: FormData
  ) => Promise<{ error?: string; success?: boolean }>;
  mode?: "create" | "edit";
  defaultValues?: {
    name?: string;
    phone?: string;
    simNumber?: string;
    simExpiry?: string;
    notes?: string;
  };
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/drivers");
      router.refresh();
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Tambah Sopir" : "Edit Sopir"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Nama lengkap sopir"
              required
              defaultValue={defaultValues?.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">No. HP</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="0812-3456-7890"
              defaultValue={defaultValues?.phone}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="simNumber">No. SIM</Label>
            <Input
              id="simNumber"
              name="simNumber"
              placeholder="Nomor SIM"
              defaultValue={defaultValues?.simNumber}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="simExpiry">Tanggal Kadaluarsa SIM</Label>
            <Input
              id="simExpiry"
              name="simExpiry"
              type="date"
              defaultValue={defaultValues?.simExpiry}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Input
              id="notes"
              name="notes"
              placeholder="Alamat, pengalaman, dll."
              defaultValue={defaultValues?.notes}
            />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading
          ? "Menyimpan..."
          : mode === "create"
            ? "Simpan Sopir"
            : "Simpan Perubahan"}
      </Button>
    </form>
  );
}
