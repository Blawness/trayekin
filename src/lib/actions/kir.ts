"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { kirRecords, vehicles } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { addMonths } from "@/lib/utils/status";
import { eq, and } from "drizzle-orm";

const KIR_MONTHS = 6;

export async function addKirRecord(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const vehicleId = formData.get("vehicleId") as string;
  const startDateStr = formData.get("startDate") as string;

  if (!vehicleId || !startDateStr) {
    return { error: "Data tidak lengkap." };
  }

  const [vehicle] = await db
    .select({ userId: vehicles.userId })
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1);

  if (!vehicle) return { error: "Kendaraan tidak ditemukan." };
  if (vehicle.userId !== session.user.id) throw new Error("Unauthorized");

  const startDate = new Date(startDateStr);

  try {
    await db.insert(kirRecords).values({
      vehicleId,
      startDate: startDate.toISOString().split("T")[0],
      endDate: addMonths(startDate, KIR_MONTHS).toISOString().split("T")[0],
    });

    revalidatePath(`/vehicles/${vehicleId}`);
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("addKirRecord:", error);
    return { error: "Gagal menyimpan data KIR." };
  }
}

export async function deleteKirRecord(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const [record] = await db
      .select({ id: kirRecords.id, vehicleId: kirRecords.vehicleId })
      .from(kirRecords)
      .innerJoin(vehicles, eq(kirRecords.vehicleId, vehicles.id))
      .where(and(eq(kirRecords.id, id), eq(vehicles.userId, session.user.id!)));

    if (!record) return { error: "Data KIR tidak ditemukan." };

    await db.delete(kirRecords).where(eq(kirRecords.id, id));
    revalidatePath(`/vehicles/${record.vehicleId}`);
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("deleteKirRecord:", error);
    return { error: "Gagal menghapus data KIR." };
  }
}
