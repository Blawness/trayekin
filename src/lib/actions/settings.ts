"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

export type AppSetting = {
  key: string;
  value: string;
  type: string | null;
};

export async function getAppSettings(): Promise<AppSetting[]> {
  const session = await auth();
  if (!session?.user) return [];

  try {
    const rows = await db
      .select({ key: appSettings.key, value: appSettings.value, type: appSettings.type })
      .from(appSettings);
    return rows;
  } catch (error) {
    console.error("getAppSettings:", error);
    return [];
  }
}

export async function updateAppSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const ratePerKm = formData.get("rate_per_km") as string;
  const fuelPrice = formData.get("fuel_price_per_liter") as string;
  const fuelConsumption = formData.get("fuel_consumption_km_per_l") as string;

  if (!ratePerKm || !fuelPrice || !fuelConsumption) {
    return { error: "Semua field wajib diisi." };
  }

  const settings = [
    { key: "rate_per_km", value: ratePerKm },
    { key: "fuel_price_per_liter", value: fuelPrice },
    { key: "fuel_consumption_km_per_l", value: fuelConsumption },
  ];

  try {
    for (const s of settings) {
      await db
        .insert(appSettings)
        .values({ key: s.key, value: s.value, type: "number" })
        .onConflictDoUpdate({
          target: appSettings.key,
          set: { value: s.value, updatedAt: new Date() },
        });
    }

    revalidatePath("/");
    revalidatePath("/settings");
    revalidatePath("/reports");
    return { success: true };
  } catch (error) {
    console.error("updateAppSettings:", error);
    return { error: "Gagal menyimpan pengaturan." };
  }
}
