"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { formatDate } from "@/lib/utils/status";
import { Trash2 } from "lucide-react";

type ServiceRecord = {
  id: string;
  serviceDate: string;
  type: string;
  nextServiceDate: string;
  notes: string | null;
  cost: number | null;
};

type Props = {
  records: ServiceRecord[];
  deleteAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
};

export function ServiceHistorySection({ records, deleteAction }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleDelete(formData: FormData) {
    const id = formData.get("id") as string;
    if (!confirm("Yakin ingin menghapus data servis ini?")) return;
    setDeletingId(id);
    const result = await deleteAction(formData);
    if (result?.error) {
      toast(result.error, "error");
    } else {
      toast("Data servis berhasil dihapus.", "success");
    }
    setDeletingId(null);
  }

  if (records.length === 0) return null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">Riwayat Servis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-sm border-b pb-2">
              <div>
                <div>{formatDate(new Date(r.serviceDate))}</div>
                <div className="text-xs text-muted-foreground">
                  {r.type} {r.notes && `— ${r.notes}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">
                  Berikutnya: {formatDate(new Date(r.nextServiceDate))}
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
