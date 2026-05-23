"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/toast";
import { getStatus, getStatusLabel, getStatusColor, formatDate } from "@/lib/utils/status";
import { Trash2 } from "lucide-react";

type Part = {
  id: string;
  partName: string;
  cost: number;
  date: string;
  odometer: number | null;
  lifespanMonths: number | null;
  nextReplaceDate: string | null;
  notes: string | null;
};

type Props = {
  parts: Part[];
  deleteAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
};

export function PartHistorySection({ parts, deleteAction }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleDelete(formData: FormData) {
    const id = formData.get("id") as string;
    if (!confirm("Yakin ingin menghapus data suku cadang ini?")) return;
    setDeletingId(id);
    const result = await deleteAction(formData);
    if (result?.error) {
      toast(result.error, "error");
    } else {
      toast("Data suku cadang berhasil dihapus.", "success");
    }
    setDeletingId(null);
  }

  if (parts.length === 0) return null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">Riwayat Suku Cadang</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {parts.map((p) => {
            const dueStatus = p.nextReplaceDate
              ? getStatus(new Date(p.nextReplaceDate))
              : null;
            return (
              <div key={p.id} className="flex items-center justify-between text-sm border-b pb-2">
                <div>
                  <div className="font-medium">{p.partName}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(new Date(p.date))}
                    {p.odometer &&
                      ` · ${p.odometer.toLocaleString("id-ID")} KM`}
                    {p.cost > 0 &&
                      ` · Rp ${p.cost.toLocaleString("id-ID")}`}
                  </div>
                  {p.notes && (
                    <div className="text-xs text-muted-foreground">
                      {p.notes}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right text-xs">
                    {p.lifespanMonths && (
                      <div className="text-muted-foreground">
                        Umur: {p.lifespanMonths} bln
                      </div>
                    )}
                    {p.nextReplaceDate && dueStatus && (
                      <Badge className={`mt-0.5 ${getStatusColor(dueStatus)}`}>
                        {getStatusLabel(dueStatus)}:{" "}
                        {formatDate(new Date(p.nextReplaceDate))}
                      </Badge>
                    )}
                  </div>
                  <form action={handleDelete}>
                    <input type="hidden" name="id" value={p.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      disabled={deletingId === p.id}
                    >
                      {deletingId === p.id ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
