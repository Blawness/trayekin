"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { getUnreadCount, getNotifications, markAsRead } from "@/lib/actions/notifications";

type NotificationItem = Awaited<ReturnType<typeof getNotifications>>[number];

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);

  const fetchCount = useCallback(async () => {
    const c = await getUnreadCount();
    setCount(c);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  async function toggle() {
    if (!open) {
      const list = await getNotifications();
      setItems(list);
    }
    setOpen(!open);
  }

  async function handleMarkAllRead() {
    const ids = items.filter((i) => !i.isRead).map((i) => i.id);
    if (ids.length > 0) {
      await markAsRead(ids);
      setCount(0);
      setItems(items.map((i) => ({ ...i, isRead: new Date() })));
    }
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={toggle} className="relative">
        <Bell className="size-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
            {count}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-popover border rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-3.5 border-b flex justify-between items-center">
            <span className="font-semibold text-sm">Notifikasi</span>
            {count > 0 && (
              <Button variant="ghost" size="xs" onClick={handleMarkAllRead}>
                Tandai semua
              </Button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Belum ada notifikasi.
            </div>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "px-3.5 py-3 border-b last:border-0 text-sm transition-colors",
                  n.isRead ? "" : "bg-blue-50/50 dark:bg-blue-950/30"
                )}
              >
                <p className="leading-snug">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {n.vehicle?.plate} ·{" "}
                  {new Date(n.createdAt).toLocaleDateString("id-ID")}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
