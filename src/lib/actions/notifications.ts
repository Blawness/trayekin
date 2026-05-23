"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { notifications, vehicles } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, sql, inArray, and, isNull } from "drizzle-orm";

export async function getNotifications() {
  const session = await auth();
  if (!session?.user) return [];

  try {
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
  } catch (error) {
    console.error("getNotifications:", error);
    return [];
  }
}

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user) return 0;

  try {
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
  } catch (error) {
    console.error("getUnreadCount:", error);
    return 0;
  }
}

export async function markAsRead(notificationIds: string[]) {
  const session = await auth();
  if (!session?.user) return;

  if (notificationIds.length === 0) return;

  try {
    await db
      .update(notifications)
      .set({ isRead: new Date() })
      .where(inArray(notifications.id, notificationIds));

    revalidatePath("/", "layout");
  } catch (error) {
    console.error("markAsRead:", error);
  }
}
