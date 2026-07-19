import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  notifications,
  kirRecords,
  serviceRecords,
  stnkRecords,
  partReplacements,
  vehicles,
  pushSubscriptions,
  cronLogs,
} from "@/lib/db/schema";
import { eq, sql, inArray, isNotNull } from "drizzle-orm";
import { webpush, ensureVapid } from "@/lib/push";

const REMINDER_DAYS = [30, 14, 7, 3, 1];

function isReminderDay(dueDate: Date): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return REMINDER_DAYS.includes(diffDays);
}

function fmt(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function dedupeLatest<T extends { vehicles: typeof vehicles.$inferSelect }>(
  rows: T[]
): T[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const vid = row.vehicles.id;
    if (seen.has(vid)) return false;
    seen.add(vid);
    return true;
  });
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = new Date();
  let recordsProcessed = 0;

  try {
    const allKir = await db
      .select()
      .from(kirRecords)
      .innerJoin(vehicles, eq(kirRecords.vehicleId, vehicles.id))
      .orderBy(sql`${kirRecords.vehicleId}, ${kirRecords.startDate} DESC`);

    for (const row of dedupeLatest(allKir)) {
      const r = row.kir_records;
      const v = row.vehicles;
      if (isReminderDay(new Date(r.endDate))) {
        await db.insert(notifications).values({
          userId: v.userId,
          vehicleId: v.id,
          type: "kir",
          message: `KIR kendaraan ${v.plate} akan kadaluarsa pada ${fmt(new Date(r.endDate))}. Segera perpanjang!`,
          dueDate: r.endDate,
        });
        recordsProcessed++;
      }
    }

    const allService = await db
      .select()
      .from(serviceRecords)
      .innerJoin(vehicles, eq(serviceRecords.vehicleId, vehicles.id))
      .orderBy(sql`${serviceRecords.vehicleId}, ${serviceRecords.serviceDate} DESC`);

    for (const row of dedupeLatest(allService)) {
      const r = row.service_records;
      const v = row.vehicles;
      if (isReminderDay(new Date(r.nextServiceDate))) {
        const formatted = fmt(new Date(r.nextServiceDate));
        await db.insert(notifications).values({
          userId: v.userId,
          vehicleId: v.id,
          type: "service",
          message: `Servis kendaraan ${v.plate} dijadwalkan pada ${formatted}. Jangan sampai terlewat!`,
          dueDate: r.nextServiceDate,
        });
        recordsProcessed++;
      }
    }

    const allStnk = await db
      .select()
      .from(stnkRecords)
      .innerJoin(vehicles, eq(stnkRecords.vehicleId, vehicles.id))
      .orderBy(sql`${stnkRecords.vehicleId}, ${stnkRecords.startDate} DESC`);

    for (const row of dedupeLatest(allStnk)) {
      const r = row.stnk_records;
      const v = row.vehicles;
      if (isReminderDay(new Date(r.endDate))) {
        await db.insert(notifications).values({
          userId: v.userId,
          vehicleId: v.id,
          type: "stnk",
          message: `STNK kendaraan ${v.plate} akan kadaluarsa pada ${fmt(new Date(r.endDate))}. Segera perpanjang!`,
          dueDate: r.endDate,
        });
        recordsProcessed++;
      }
    }

    const allParts = await db
      .select()
      .from(partReplacements)
      .innerJoin(vehicles, eq(partReplacements.vehicleId, vehicles.id))
      .where(isNotNull(partReplacements.nextReplaceDate))
      .orderBy(sql`${partReplacements.vehicleId}, ${partReplacements.partName}, ${partReplacements.date} DESC`);

    const partsKey = new Map<string, typeof allParts[number]>();
    for (const row of allParts) {
      const key = `${row.vehicles.id}:${row.part_replacements.partName}`;
      if (!partsKey.has(key)) partsKey.set(key, row);
    }
    for (const row of partsKey.values()) {
      const r = row.part_replacements;
      const v = row.vehicles;
      if (r.nextReplaceDate && isReminderDay(new Date(r.nextReplaceDate))) {
        await db.insert(notifications).values({
          userId: v.userId,
          vehicleId: v.id,
          type: "part",
          message: `${r.partName} kendaraan ${v.plate} perlu diganti sekitar ${fmt(new Date(r.nextReplaceDate))}.`,
          dueDate: r.nextReplaceDate,
        });
        recordsProcessed++;
      }
    }

    // Push notifications
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayNotifications = await db
      .selectDistinct({ userId: notifications.userId })
      .from(notifications)
      .where(
        sql`${notifications.createdAt}::date = ${today.toISOString().split("T")[0]}::date`
      );

    const userIds = todayNotifications.map((n) => n.userId);
    if (userIds.length > 0) {
      const subs = await db
        .select()
        .from(pushSubscriptions)
        .where(inArray(pushSubscriptions.userId, userIds));

      ensureVapid();
      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            JSON.stringify({
              title: "Trayekin — Pengingat",
              body: "Ada KIR, servis, STNK, atau suku cadang yang perlu perhatian Anda.",
              url: "/dashboard",
            })
          );
        } catch (err) {
          console.error("Push failed for subscription:", err);
        }
      }
    }

    await db.insert(cronLogs).values({
      jobName: "check-reminders",
      runAt: startTime,
      status: "success",
      recordsProcessed,
    });

    return NextResponse.json({ success: true, recordsProcessed });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("check-reminders cron failed:", error);

    try {
      await db.insert(cronLogs).values({
        jobName: "check-reminders",
        runAt: startTime,
        status: "failed",
        errorMessage,
      });
    } catch (logError) {
      console.error("Failed to insert cron log:", logError);
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
