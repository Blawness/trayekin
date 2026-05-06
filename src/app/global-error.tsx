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
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-xl font-bold mb-2">Terjadi Kesalahan</h1>
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
