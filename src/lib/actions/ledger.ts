"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { dailyLedger, appSettings } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, sql, and, gte } from "drizzle-orm";

const LEDGER_ENTRY_LIMIT = 90;

export async function addLedgerEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const vehicleId = formData.get("vehicleId") as string;
  const driverId = formData.get("driverId") as string;
  const dateStr = formData.get("date") as string;
  const kmStr = formData.get("km") as string;
  const revenueStr = formData.get("revenue") as string;
  const expensesStr = formData.get("expenses") as string;
  const notes = formData.get("notes") as string;

  if (!vehicleId || !dateStr) return { error: "Data tidak lengkap." };

  const km = kmStr ? parseInt(kmStr, 10) : null;

  let revenue = 0;
  let snapshotRatePerKm: number | null = null;
  let snapshotFuelPrice: number | null = null;
  let snapshotFuelConsumption: number | null = null;

  if (km && km > 0) {
    const settings = await db.select().from(appSettings).where(eq(appSettings.userId, session.user.id!));
    const settingsMap = Object.fromEntries(
      settings.map((s) => [s.key, parseInt(s.value, 10)])
    );
    snapshotRatePerKm = settingsMap["rate_per_km"] || 4500;
    snapshotFuelPrice = settingsMap["fuel_price_per_liter"] || 10000;
    snapshotFuelConsumption = settingsMap["fuel_consumption_km_per_l"] || 10;
    revenue = km * snapshotRatePerKm;
  } else {
    revenue = parseInt(revenueStr, 10) || 0;
  }

  try {
    await db.insert(dailyLedger).values({
      vehicleId,
      driverId: driverId || null,
      date: dateStr,
      km,
      revenue,
      expenses: parseInt(expensesStr, 10) || 0,
      notes: notes || null,
      snapshotRatePerKm,
      snapshotFuelPrice,
      snapshotFuelConsumption,
    });

    revalidatePath(`/vehicles/${vehicleId}`);
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("addLedgerEntry:", error);
    return { error: "Gagal menyimpan setoran." };
  }
}

export async function getLedgerEntries(vehicleId: string) {
  const session = await auth();
  if (!session?.user) return [];

  try {
    return db
      .select()
      .from(dailyLedger)
      .where(eq(dailyLedger.vehicleId, vehicleId))
      .orderBy(desc(dailyLedger.date))
      .limit(LEDGER_ENTRY_LIMIT);
  } catch (error) {
    console.error("getLedgerEntries:", error);
    return [];
  }
}

export async function getLedgerEntriesByDriver(driverId: string) {
  const session = await auth();
  if (!session?.user) return [];

  try {
    return db
      .select()
      .from(dailyLedger)
      .where(eq(dailyLedger.driverId, driverId))
      .orderBy(desc(dailyLedger.date))
      .limit(LEDGER_ENTRY_LIMIT);
  } catch (error) {
    console.error("getLedgerEntriesByDriver:", error);
    return [];
  }
}

export async function getLedgerSummary(vehicleId: string, since: Date) {
  const session = await auth();
  if (!session?.user) return null;

  try {
    const [result] = await db
      .select({
        totalRevenue: sql<number>`coalesce(sum(${dailyLedger.revenue}), 0)`.mapWith(Number),
        totalExpenses: sql<number>`coalesce(sum(${dailyLedger.expenses}), 0)`.mapWith(Number),
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(dailyLedger)
      .where(
        and(
          eq(dailyLedger.vehicleId, vehicleId),
          gte(dailyLedger.date, since.toISOString().split("T")[0])
        )
      );

    return result;
  } catch (error) {
    console.error("getLedgerSummary:", error);
    return null;
  }
}

export async function getDriverLedgerSummary(driverId: string, since: Date) {
  const session = await auth();
  if (!session?.user) return null;

  try {
    const [result] = await db
      .select({
        totalRevenue: sql<number>`coalesce(sum(${dailyLedger.revenue}), 0)`.mapWith(Number),
        totalExpenses: sql<number>`coalesce(sum(${dailyLedger.expenses}), 0)`.mapWith(Number),
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(dailyLedger)
      .where(
        and(
          eq(dailyLedger.driverId, driverId),
          gte(dailyLedger.date, since.toISOString().split("T")[0])
        )
      );

    return result;
  } catch (error) {
    console.error("getDriverLedgerSummary:", error);
    return null;
  }
}
