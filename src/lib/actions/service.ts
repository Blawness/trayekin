"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { serviceRecords, vehicles } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { addMonths } from "@/lib/utils/status";
import { eq, and } from "drizzle-orm";

const SERVICE_MONTHS = 3;

export async function addServiceRecord(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const vehicleId = formData.get("vehicleId") as string;
  const serviceDateStr = formData.get("serviceDate") as string;
  const type = (formData.get("type") as string) || "rutin";
  const notes = (formData.get("notes") as string) || null;

  if (!vehicleId || !serviceDateStr) {
    return { error: "Data tidak lengkap." };
  }

  const [vehicle] = await db
    .select({ userId: vehicles.userId })
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1);

  if (!vehicle) return { error: "Kendaraan tidak ditemukan." };
  if (vehicle.userId !== session.user.id) throw new Error("Unauthorized");

  const serviceDate = new Date(serviceDateStr);

  try {
    await db.insert(serviceRecords).values({
      vehicleId,
      serviceDate: serviceDate.toISOString().split("T")[0],
      type: type as "rutin" | "besar" | "lainnya",
      notes,
      nextServiceDate: addMonths(serviceDate, SERVICE_MONTHS).toISOString().split("T")[0],
    });

    revalidatePath(`/vehicles/${vehicleId}`);
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("addServiceRecord:", error);
    return { error: "Gagal menyimpan data servis." };
  }
}

export async function deleteServiceRecord(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const [record] = await db
      .select({ id: serviceRecords.id, vehicleId: serviceRecords.vehicleId })
      .from(serviceRecords)
      .innerJoin(vehicles, eq(serviceRecords.vehicleId, vehicles.id))
      .where(and(eq(serviceRecords.id, id), eq(vehicles.userId, session.user.id!)));

    if (!record) return { error: "Data servis tidak ditemukan." };

    await db.delete(serviceRecords).where(eq(serviceRecords.id, id));
    revalidatePath(`/vehicles/${record.vehicleId}`);
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("deleteServiceRecord:", error);
    return { error: "Gagal menghapus data servis." };
  }
}
