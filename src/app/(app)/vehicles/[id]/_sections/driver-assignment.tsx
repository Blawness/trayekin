"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/toast";
import type { getDrivers } from "@/lib/actions/drivers";
import type { getAssignmentsForVehicle } from "@/lib/actions/driverAssignments";
import { X } from "lucide-react";

type Driver = Awaited<ReturnType<typeof getDrivers>>[number];
type Assignment = Awaited<ReturnType<typeof getAssignmentsForVehicle>>[number];

type Props = {
  vehicleId: string;
  drivers: Driver[];
  assignments: Assignment[];
  assignAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  removeAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
};

export function DriverAssignmentSection({
  vehicleId,
  drivers,
  assignments,
  assignAction,
  removeAction,
}: Props) {
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleAssign(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await assignAction(formData);
    if (result?.error) {
      setError(result.error);
      toast(result.error, "error");
    } else {
      toast("Sopir berhasil ditugaskan.", "success");
      setSelectedDriver("");
      setSelectedDate("");
      const form = document.getElementById("assign-form") as HTMLFormElement;
      form?.reset();
    }
    setLoading(false);
  }

  async function handleRemove(formData: FormData) {
    const assignmentId = formData.get("assignmentId") as string;
    setRemovingId(assignmentId);
    const result = await removeAction(formData);
    if (result?.error) {
      toast(result.error, "error");
    } else {
      toast("Penugasan berhasil dihapus.", "success");
    }
    setRemovingId(null);
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">Penugasan Sopir</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form id="assign-form" action={handleAssign} className="space-y-2">
          <input type="hidden" name="vehicleId" value={vehicleId} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="assignDriver">Sopir</Label>
              <select
                id="assignDriver"
                name="driverId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                required
              >
                <option value="">-- Pilih sopir --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="assignDate">Tanggal</Label>
              <Input
                id="assignDate"
                name="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Menyimpan..." : "Assign"}
            </Button>
          </div>
        </form>

        {assignments.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Daftar Penugasan
            </div>
            {assignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between text-sm border rounded-md px-3 py-2"
              >
                <div>
                  <span className="font-medium">{a.driverName}</span>
                  <span className="text-muted-foreground ml-2">
                    {new Date(a.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <form action={handleRemove}>
                  <input type="hidden" name="assignmentId" value={a.id} />
                  <input type="hidden" name="vehicleId" value={vehicleId} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    disabled={removingId === a.id}
                  >
                    {removingId === a.id ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
