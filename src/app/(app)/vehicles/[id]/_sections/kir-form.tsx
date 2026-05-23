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

export function KirFormSection({ vehicleId, action }: Props) {
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
      toast("Data KIR berhasil disimpan.", "success");
      const form = document.getElementById("kir-form") as HTMLFormElement;
      form?.reset();
    }
    setLoading(false);
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">Catat KIR Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="kir-form" action={handleSubmit} className="space-y-2">
          <input type="hidden" name="vehicleId" value={vehicleId} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai KIR</Label>
              <Input id="startDate" name="startDate" type="date" required />
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
