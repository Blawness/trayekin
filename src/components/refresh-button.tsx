"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function RefreshButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => router.refresh()}
      title="Segarkan data"
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  );
}
