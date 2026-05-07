"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { stnkRecords } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { addMonths } from "@/lib/utils/status";
import { eq, desc } from "drizzle-orm";

const STNK_MONTHS: Record<string, number> = {
  tahunan: 12,
  lima_tahunan: 60,
  asuransi: 12,
};

export async function addStnkRecord(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const vehicleId = formData.get("vehicleId") as string;
  const type = (formData.get("stnkType") as string) || "tahunan";
  const startDateStr = formData.get("startDate") as string;
  const notes = formData.get("notes") as string;

  if (!vehicleId || !startDateStr) return { error: "Data tidak lengkap." };

  const startDate = new Date(startDateStr);
  const months = STNK_MONTHS[type] ?? 12;

  try {
    await db.insert(stnkRecords).values({
      vehicleId,
      type: type as "tahunan" | "lima_tahunan" | "asuransi",
      startDate: startDate.toISOString().split("T")[0],
      endDate: addMonths(startDate, months).toISOString().split("T")[0],
      notes: notes || null,
    });

    revalidatePath("/");
    revalidatePath(`/vehicles/${vehicleId}`);
    return { success: true };
  } catch (error) {
    console.error("addStnkRecord:", error);
    return { error: "Gagal menyimpan data STNK." };
  }
}

export async function getStnkRecords(vehicleId: string) {
  const session = await auth();
  if (!session?.user) return [];

  try {
    return db
      .select()
      .from(stnkRecords)
      .where(eq(stnkRecords.vehicleId, vehicleId))
      .orderBy(desc(stnkRecords.startDate));
  } catch (error) {
    console.error("getStnkRecords:", error);
    return [];
  }
}
