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

export function StnkFormSection({ vehicleId, action }: Props) {
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
      toast("Data STNK berhasil disimpan.", "success");
      const form = document.getElementById("stnk-form") as HTMLFormElement;
      form?.reset();
    }
    setLoading(false);
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">Catat STNK / Asuransi</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="stnk-form" action={handleSubmit} className="space-y-3">
          <input type="hidden" name="vehicleId" value={vehicleId} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="stnkType">Jenis</Label>
            <select
              id="stnkType"
              name="stnkType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="tahunan">Pajak Tahunan</option>
              <option value="lima_tahunan">Pajak 5 Tahunan</option>
              <option value="asuransi">Asuransi</option>
            </select>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="stnkStartDate">Tanggal Mulai</Label>
              <Input id="stnkStartDate" name="startDate" type="date" required />
            </div>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
