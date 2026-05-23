"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/toast";
import { getStatus, getStatusLabel, getStatusColor, formatDate } from "@/lib/utils/status";
import { Trash2 } from "lucide-react";

type KirRecord = {
  id: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  cost: number | null;
};

type Props = {
  records: KirRecord[];
  deleteAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
};

export function KirHistorySection({ records, deleteAction }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleDelete(formData: FormData) {
    const id = formData.get("id") as string;
    if (!confirm("Yakin ingin menghapus data KIR ini?")) return;
    setDeletingId(id);
    const result = await deleteAction(formData);
    if (result?.error) {
      toast(result.error, "error");
    } else {
      toast("Data KIR berhasil dihapus.", "success");
    }
    setDeletingId(null);
  }

  if (records.length === 0) return null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">Riwayat KIR</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-sm border-b pb-2">
              <div className="flex items-center gap-2">
                <span>
                  {formatDate(new Date(r.startDate))} — {formatDate(new Date(r.endDate))}
                </span>
                <Badge className={getStatusColor(getStatus(new Date(r.endDate)))}>
                  {getStatusLabel(getStatus(new Date(r.endDate)))}
                </Badge>
              </div>
              <form action={handleDelete}>
                <input type="hidden" name="id" value={r.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  disabled={deletingId === r.id}
                >
                  {deletingId === r.id ? (
                    <span className="text-xs">...</span>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
