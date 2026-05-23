"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { kirRecords } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { addMonths } from "@/lib/utils/status";

const KIR_MONTHS = 6;

export async function addKirRecord(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const vehicleId = formData.get("vehicleId") as string;
  const startDateStr = formData.get("startDate") as string;

  if (!vehicleId || !startDateStr) {
    return { error: "Data tidak lengkap." };
  }

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
