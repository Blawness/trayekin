"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, sql, inArray } from "drizzle-orm";

export async function getNotifications() {
  const session = await auth();
  if (!session?.user) return [];

  return db.query.notifications.findMany({
    where: eq(notifications.userId, session.user.id!),
    orderBy: desc(notifications.createdAt),
    limit: 20,
    with: {
      vehicle: true,
    },
  });
}

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user) return 0;

  const result = await db
    .select({ count: sql`count(*)` })
    .from(notifications)
    .where(
      sql`${notifications.userId} = ${session.user.id} AND ${notifications.isRead} IS NULL`
    );

  return Number(result[0]?.count ?? 0);
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
