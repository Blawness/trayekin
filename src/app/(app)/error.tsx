"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AppError({
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
      <div className="size-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="size-10 text-destructive" />
      </div>
      <h2 className="text-lg font-bold tracking-tight mb-2">Terjadi Kesalahan</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        {error.message || "Gagal memuat halaman. Silakan coba lagi."}
      </p>
      <Button onClick={reset} variant="default">
        Coba Lagi
      </Button>
    </div>
  );
}
