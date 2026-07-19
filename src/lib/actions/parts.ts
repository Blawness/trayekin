"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { partReplacements, vehicles } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { addMonths } from "@/lib/utils/status";
import { eq, and, desc } from "drizzle-orm";

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

  const [vehicle] = await db
    .select({ userId: vehicles.userId })
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1);

  if (!vehicle) return { error: "Kendaraan tidak ditemukan." };
  if (vehicle.userId !== session.user.id) throw new Error("Unauthorized");

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

export async function deletePartReplacement(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const [record] = await db
      .select({ id: partReplacements.id, vehicleId: partReplacements.vehicleId })
      .from(partReplacements)
      .innerJoin(vehicles, eq(partReplacements.vehicleId, vehicles.id))
      .where(and(eq(partReplacements.id, id), eq(vehicles.userId, session.user.id!)));

    if (!record) return { error: "Data suku cadang tidak ditemukan." };

    await db.delete(partReplacements).where(eq(partReplacements.id, id));
    revalidatePath(`/vehicles/${record.vehicleId}`);
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("deletePartReplacement:", error);
    return { error: "Gagal menghapus data suku cadang." };
  }
}

export async function getPartReplacements(vehicleId: string) {
  const session = await auth();
  if (!session?.user) return [];

  const [vehicle] = await db
    .select({ userId: vehicles.userId })
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1);

  if (!vehicle || vehicle.userId !== session.user.id) return [];

  try {
    return db
      .select()
      .from(partReplacements)
      .where(eq(partReplacements.vehicleId, vehicleId))
      .orderBy(desc(partReplacements.date))
      .limit(50);
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
