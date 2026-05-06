"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
      <h2 className="text-lg font-semibold mb-2">Gagal Memuat Laporan</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Terjadi kesalahan saat memuat laporan armada.
      </p>
      <Button onClick={reset} variant="default">
        Coba Lagi
      </Button>
    </div>
  );
}
