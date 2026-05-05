import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  notifications,
  kirRecords,
  serviceRecords,
  vehicles,
  pushSubscriptions,
} from "@/lib/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { webpush } from "@/lib/push";

const REMINDER_DAYS = [30, 14, 7, 3, 1];

function isReminderDay(dueDate: Date): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return REMINDER_DAYS.includes(diffDays);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check KIR records
  const allKir = await db
    .select({
      kir: kirRecords,
      vehicle: vehicles,
    })
    .from(kirRecords)
    .innerJoin(vehicles, eq(kirRecords.vehicleId, vehicles.id))
    .orderBy(sql`${kirRecords.vehicleId}, ${kirRecords.startDate} DESC`);

  // Deduplicate: only latest per vehicle
  const seenVehiclesKir = new Set<string>();
  const latestKirPerVehicle = allKir.filter((row) => {
    const vid = row.vehicle.id;
    if (seenVehiclesKir.has(vid)) return false;
    seenVehiclesKir.add(vid);
    return true;
  });

  for (const record of latestKirPerVehicle) {
    if (isReminderDay(new Date(record.kir.endDate))) {
      const formatted = new Date(record.kir.endDate).toLocaleDateString(
        "id-ID",
        { day: "numeric", month: "long", year: "numeric" }
      );

      await db.insert(notifications).values({
        userId: record.vehicle.userId,
        vehicleId: record.vehicle.id,
        type: "kir",
        message: `KIR kendaraan ${record.vehicle.plate} akan kadaluarsa pada ${formatted}. Segera perpanjang!`,
        dueDate: record.kir.endDate,
      });
    }
  }

  // Check service records
  const allService = await db
    .select({
      sr: serviceRecords,
      vehicle: vehicles,
    })
    .from(serviceRecords)
    .innerJoin(vehicles, eq(serviceRecords.vehicleId, vehicles.id))
    .orderBy(sql`${serviceRecords.vehicleId}, ${serviceRecords.serviceDate} DESC`);

  // Deduplicate: only latest per vehicle
  const seenVehiclesService = new Set<string>();
  const latestServicePerVehicle = allService.filter((row) => {
    const vid = row.vehicle.id;
    if (seenVehiclesService.has(vid)) return false;
    seenVehiclesService.add(vid);
    return true;
  });

  for (const record of latestServicePerVehicle) {
    if (isReminderDay(new Date(record.sr.nextServiceDate))) {
      const formatted = new Date(
        record.sr.nextServiceDate
      ).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      await db.insert(notifications).values({
        userId: record.vehicle.userId,
        vehicleId: record.vehicle.id,
        type: "service",
        message: `Servis kendaraan ${record.vehicle.plate} dijadwalkan pada ${formatted}. Jangan sampai terlewat!`,
        dueDate: record.sr.nextServiceDate,
      });
    }
  }

  // Send push to all users who got notifications today
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

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({
            title: "Trayekin — Pengingat",
            body: "Ada KIR atau servis yang perlu perhatian Anda.",
            url: "/",
          })
        );
      } catch (err) {
        console.error("Push failed for subscription:", err);
      }
    }
  }

  return NextResponse.json({ success: true });
}
