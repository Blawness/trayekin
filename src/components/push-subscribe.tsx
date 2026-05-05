"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function PushSubscribe() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      if (Notification.permission === "default") {
        setShow(true);
      }
    }
  }, []);

  async function subscribe() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setLoading(false);
        setShow(false);
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      setShow(false);
    } catch (err) {
      console.error("Push subscribe failed:", err);
    }
    setLoading(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-28 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="bg-blue-600 text-white rounded-lg p-4 shadow-lg flex items-center gap-3">
        <p className="text-sm flex-1">
          Izinkan notifikasi agar tidak terlewat pengingat KIR dan servis.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={subscribe}
          disabled={loading}
        >
          {loading ? "..." : "Izinkan"}
        </Button>
      </div>
    </div>
  );
}
