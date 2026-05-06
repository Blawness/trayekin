"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { stnkRecords } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { addMonths } from "@/lib/utils/status";
import { eq, desc } from "drizzle-orm";

export async function addStnkRecord(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const vehicleId = formData.get("vehicleId") as string;
  const type = (formData.get("stnkType") as string) || "tahunan";
  const startDateStr = formData.get("startDate") as string;
  const notes = formData.get("notes") as string;

  if (!vehicleId || !startDateStr) return { error: "Data tidak lengkap." };

  const startDate = new Date(startDateStr);
  const months = type === "lima_tahunan" ? 60 : type === "asuransi" ? 12 : 12;

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
}

export async function getStnkRecords(vehicleId: string) {
  const session = await auth();
  if (!session?.user) return [];

  return db
    .select()
    .from(stnkRecords)
    .where(eq(stnkRecords.vehicleId, vehicleId))
    .orderBy(desc(stnkRecords.startDate));
}
