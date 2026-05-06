"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { notifications, vehicles } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, sql, inArray, and, isNull } from "drizzle-orm";

export async function getNotifications() {
  const session = await auth();
  if (!session?.user) return [];

  const notificationList = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id!))
    .orderBy(desc(notifications.createdAt))
    .limit(20);

  if (notificationList.length === 0) return [];

  const vehicleIds = [
    ...new Set(notificationList.map((n) => n.vehicleId)),
  ];

  const vehicleList = await db
    .select()
    .from(vehicles)
    .where(inArray(vehicles.id, vehicleIds));

  const vehicleMap = new Map(vehicleList.map((v) => [v.id, v]));

  return notificationList.map((n) => ({
    ...n,
    vehicle: vehicleMap.get(n.vehicleId) ?? null,
  }));
}

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user) return 0;

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, session.user.id!),
        isNull(notifications.isRead),
      )
    );

  return Number(result?.count ?? 0);
}

export async function markAsRead(notificationIds: string[]) {
  const session = await auth();
  if (!session?.user) return;

  if (notificationIds.length === 0) return;

  await db
    .update(notifications)
    .set({ isRead: new Date() })
    .where(inArray(notifications.id, notificationIds));

  revalidatePath("/");
}
