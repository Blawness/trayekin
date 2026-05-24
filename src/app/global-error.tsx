"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
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
    <html lang="id">
      <body className="bg-background text-foreground font-sans">
        <main className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="size-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="size-10 text-destructive" />
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-2">Terjadi Kesalahan</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Aplikasi mengalami masalah. Silakan muat ulang halaman.
            </p>
            <Button onClick={reset} variant="default" size="lg">
              Muat Ulang
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
