"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { dailyLedger } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, sql, and, gte } from "drizzle-orm";

const LEDGER_ENTRY_LIMIT = 90;

export async function addLedgerEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const vehicleId = formData.get("vehicleId") as string;
  const driverId = formData.get("driverId") as string;
  const dateStr = formData.get("date") as string;
  const revenueStr = formData.get("revenue") as string;
  const expensesStr = formData.get("expenses") as string;
  const notes = formData.get("notes") as string;

  if (!vehicleId || !dateStr) return { error: "Data tidak lengkap." };

  try {
    await db.insert(dailyLedger).values({
      vehicleId,
      driverId: driverId || null,
      date: dateStr,
      revenue: parseInt(revenueStr) || 0,
      expenses: parseInt(expensesStr) || 0,
      notes: notes || null,
    });

    revalidatePath("/");
    revalidatePath(`/vehicles/${vehicleId}`);
    revalidatePath("/reports");
    revalidatePath("/drivers");
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
