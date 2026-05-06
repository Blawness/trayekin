"use client";

import { useState, useEffect, useCallback } from "react";
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
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
            {count}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-popover border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b flex justify-between items-center">
            <span className="font-semibold text-sm">Notifikasi</span>
            {count > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs">
                Tandai semua
              </Button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Belum ada notifikasi.
            </div>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                className={`p-3 border-b text-sm ${!n.isRead ? "bg-blue-50 dark:bg-blue-950" : ""}`}
              >
                <p>{n.message}</p>
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
