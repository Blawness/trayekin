"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/toast";

type Props = {
  vehicleId: string;
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
};

export function ServiceFormSection({ vehicleId, action }: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      toast(result.error, "error");
    } else {
      toast("Data servis berhasil disimpan.", "success");
      const form = document.getElementById("service-form") as HTMLFormElement;
      form?.reset();
    }
    setLoading(false);
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">Catat Servis Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="service-form" action={handleSubmit} className="space-y-3">
          <input type="hidden" name="vehicleId" value={vehicleId} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="serviceDate">Tanggal Servis</Label>
            <Input id="serviceDate" name="serviceDate" type="date" required />
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
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
