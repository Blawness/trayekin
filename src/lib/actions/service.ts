"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { serviceRecords } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { addMonths } from "@/lib/utils/status";

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
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("addServiceRecord:", error);
    return { error: "Gagal menyimpan data servis." };
  }
}
