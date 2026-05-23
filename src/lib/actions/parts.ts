"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { partReplacements } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { addMonths } from "@/lib/utils/status";
import { eq, desc } from "drizzle-orm";

export async function addPartReplacement(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const vehicleId = formData.get("vehicleId") as string;
  const partName = formData.get("partName") as string;
  const costStr = formData.get("cost") as string;
  const dateStr = formData.get("date") as string;
  const odometerStr = formData.get("odometer") as string;
  const lifespanMonthsStr = formData.get("lifespanMonths") as string;
  const notes = formData.get("notes") as string;

  if (!vehicleId || !partName || !dateStr) return { error: "Data tidak lengkap." };

  const date = new Date(dateStr);
  const lifespanMonths = parseInt(lifespanMonthsStr) || null;
  const nextReplaceDate = lifespanMonths
    ? addMonths(date, lifespanMonths).toISOString().split("T")[0]
    : null;

  try {
    await db.insert(partReplacements).values({
      vehicleId,
      partName,
      cost: parseInt(costStr) || 0,
      date: date.toISOString().split("T")[0],
      odometer: parseInt(odometerStr) || null,
      lifespanMonths,
      nextReplaceDate,
      notes: notes || null,
    });

    revalidatePath(`/vehicles/${vehicleId}`);
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("addPartReplacement:", error);
    return { error: "Gagal menyimpan data suku cadang." };
  }
}

export async function getPartReplacements(vehicleId: string) {
  const session = await auth();
  if (!session?.user) return [];

  try {
    return db
      .select()
      .from(partReplacements)
      .where(eq(partReplacements.vehicleId, vehicleId))
      .orderBy(desc(partReplacements.date));
  } catch (error) {
    console.error("getPartReplacements:", error);
    return [];
  }
}

export async function getPartReplacementsDue(userId: string) {
  const session = await auth();
  if (!session?.user) return [];

  try {
    return db
      .select()
      .from(partReplacements)
      .where(eq(partReplacements.vehicleId, userId))
      .orderBy(desc(partReplacements.nextReplaceDate));
  } catch (error) {
    console.error("getPartReplacementsDue:", error);
    return [];
  }
}
