"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { driverAssignments, drivers, dailyLedger, vehicles } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, inArray, gte, lte } from "drizzle-orm";

export async function assignDriver(
  driverId: string,
  vehicleId: string,
  date: string
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!driverId || !vehicleId || !date) {
    return { error: "Data tidak lengkap." };
  }

  const [vehicle] = await db
    .select({ userId: vehicles.userId })
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1);

  if (!vehicle) return { error: "Kendaraan tidak ditemukan." };
  if (vehicle.userId !== session.user.id) throw new Error("Unauthorized");

  try {
    await db.insert(driverAssignments).values({
      driverId,
      vehicleId,
      date,
      userId: session.user.id!,
    });

    revalidatePath(`/vehicles/${vehicleId}`);
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("assignDriver:", error);
    return { error: "Gagal menugaskan sopir." };
  }
}

export async function removeAssignment(assignmentId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const [record] = await db
      .select()
      .from(driverAssignments)
      .where(eq(driverAssignments.id, assignmentId));

    if (!record || record.userId !== session.user.id) {
      return { error: "Penugasan tidak ditemukan." };
    }

    await db
      .delete(driverAssignments)
      .where(eq(driverAssignments.id, assignmentId));

    revalidatePath(`/vehicles/${record.vehicleId}`);
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("removeAssignment:", error);
    return { error: "Gagal menghapus penugasan." };
  }
}

export async function getAssignmentsForVehicle(vehicleId: string, date?: string) {
  const session = await auth();
  if (!session?.user) return [];

  try {
    const conditions = [
      eq(driverAssignments.vehicleId, vehicleId),
      eq(driverAssignments.userId, session.user.id!),
    ];
    if (date) {
      conditions.push(eq(driverAssignments.date, date));
    }

    const assignments = await db
      .select()
      .from(driverAssignments)
      .where(and(...conditions));

    if (assignments.length === 0) return [];

    const driverIds = [...new Set(assignments.map((a) => a.driverId))];
    const driverList = await db
      .select({ id: drivers.id, name: drivers.name })
      .from(drivers)
      .where(inArray(drivers.id, driverIds));

    const driverMap = Object.fromEntries(
      driverList.map((d) => [d.id, d.name])
    );

    return assignments.map((a) => ({
      ...a,
      driverName: driverMap[a.driverId] || "Tidak dikenal",
    }));
  } catch (error) {
    console.error("getAssignmentsForVehicle:", error);
    return [];
  }
}

export type DriverSummary = {
  driverId: string;
  driverName: string;
  totalKm: number;
  totalDays: number;
  avgDailyRevenue: number;
};

export async function getDriverSummaries(
  periodStart: string,
  periodEnd: string
): Promise<DriverSummary[]> {
  const session = await auth();
  if (!session?.user) return [];

  try {
    const allDrivers = await db
      .select()
      .from(drivers)
      .where(eq(drivers.userId, session.user.id!));

    if (allDrivers.length === 0) return [];

    const userVehicles = await db
      .select({ id: vehicles.id })
      .from(vehicles)
      .where(eq(vehicles.userId, session.user.id!));

    const vehicleIds = userVehicles.map((v) => v.id);
    if (vehicleIds.length === 0) return [];

    const assignments = await db
      .select()
      .from(driverAssignments)
      .where(
        and(
          eq(driverAssignments.userId, session.user.id!),
          inArray(driverAssignments.vehicleId, vehicleIds),
          gte(driverAssignments.date, periodStart),
          lte(driverAssignments.date, periodEnd)
        )
      );

    const allLedger = await db
      .select()
      .from(dailyLedger)
      .where(
        and(
          inArray(dailyLedger.vehicleId, vehicleIds),
          gte(dailyLedger.date, periodStart),
          lte(dailyLedger.date, periodEnd)
        )
      )
      .limit(500);

    const ledgerMap: Record<string, typeof allLedger> = {};
    for (const entry of allLedger) {
      const key = `${entry.vehicleId}_${entry.date}`;
      if (!ledgerMap[key]) ledgerMap[key] = [];
      ledgerMap[key].push(entry);
    }

    const driverStats: Record<string, { totalKm: number; totalRevenue: number; dates: Set<string> }> = {};

    for (const assignment of assignments) {
      const key = `${assignment.vehicleId}_${assignment.date}`;
      const matchedEntries = ledgerMap[key] || [];

      if (matchedEntries.length === 0) continue;

      if (!driverStats[assignment.driverId]) {
        driverStats[assignment.driverId] = { totalKm: 0, totalRevenue: 0, dates: new Set() };
      }

      for (const entry of matchedEntries) {
        driverStats[assignment.driverId].totalKm += entry.km || 0;
        const entryRevenue =
          entry.km && entry.km > 0
            ? entry.km * (entry.snapshotRatePerKm ?? 4500)
            : entry.revenue;
        driverStats[assignment.driverId].totalRevenue += entryRevenue;
        driverStats[assignment.driverId].dates.add(entry.date);
      }
    }

    return allDrivers
      .filter((d) => driverStats[d.id])
      .map((d) => {
        const stats = driverStats[d.id];
        const totalDays = stats.dates.size;
        const avgDailyRevenue =
          totalDays > 0 ? stats.totalRevenue / totalDays : 0;
        return {
          driverId: d.id,
          driverName: d.name,
          totalKm: stats.totalKm,
          totalDays,
          avgDailyRevenue: Math.round(avgDailyRevenue),
        };
      });
  } catch (error) {
    console.error("getDriverSummaries:", error);
    return [];
  }
}
