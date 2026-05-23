"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export type AppSetting = {
  key: string;
  value: string;
  type: string | null;
};

export async function getAppSettings(): Promise<AppSetting[]> {
  const session = await auth();
  if (!session?.user) return [];
  const userId = session.user.id!;

  try {
    const rows = await db
      .select({ key: appSettings.key, value: appSettings.value, type: appSettings.type })
      .from(appSettings)
      .where(eq(appSettings.userId, userId));

    if (rows.length === 0) {
      const defaults = [
        { key: "rate_per_km", value: "4500", type: "number" },
        { key: "fuel_price_per_liter", value: "10000", type: "number" },
        { key: "fuel_consumption_km_per_l", value: "10", type: "number" },
      ];
      for (const d of defaults) {
        await db.insert(appSettings).values({
          userId,
          key: d.key,
          value: d.value,
          type: d.type,
        });
      }
      return defaults;
    }

    return rows;
  } catch (error) {
    console.error("getAppSettings:", error);
    return [];
  }
}

export async function updateAppSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id!;

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
        .values({ userId, key: s.key, value: s.value, type: "number" })
        .onConflictDoUpdate({
          target: [appSettings.userId, appSettings.key],
          set: { value: s.value, updatedAt: new Date() },
        });
    }

    revalidatePath("/settings");
    revalidatePath("/reports");
    revalidatePath("/vehicles");
    return { success: true };
  } catch (error) {
    console.error("updateAppSettings:", error);
    return { error: "Gagal menyimpan pengaturan." };
  }
}
