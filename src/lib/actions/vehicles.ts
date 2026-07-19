"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { vehicles, kirRecords, serviceRecords, stnkRecords } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { addMonths } from "@/lib/utils/status";
import { eq, inArray, desc } from "drizzle-orm";

const KIR_MONTHS = 6;
const SERVICE_MONTHS = 3;

export async function createVehicle(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const plate = formData.get("plate") as string;
  const name = formData.get("name") as string;
  const kirStartStr = formData.get("kir_start_date") as string;
  const serviceDateStr = formData.get("service_date") as string;

  if (!plate) return { error: "Nomor polisi wajib diisi." };

  try {
    const [vehicle] = await db
      .insert(vehicles)
      .values({
        userId: session.user.id!,
        plate,
        name: name || null,
      })
      .returning();

    if (kirStartStr) {
      const startDate = new Date(kirStartStr);
      await db.insert(kirRecords).values({
        vehicleId: vehicle.id,
        startDate: startDate.toISOString().split("T")[0],
        endDate: addMonths(startDate, KIR_MONTHS).toISOString().split("T")[0],
      });
    }

    if (serviceDateStr) {
      const serviceDate = new Date(serviceDateStr);
      await db.insert(serviceRecords).values({
        vehicleId: vehicle.id,
        serviceDate: serviceDate.toISOString().split("T")[0],
        type: "rutin",
        nextServiceDate: addMonths(serviceDate, SERVICE_MONTHS).toISOString().split("T")[0],
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/vehicles");
    return { success: true, vehicleId: vehicle.id };
  } catch (error) {
    console.error("createVehicle:", error);
    return { error: "Gagal membuat kendaraan." };
  }
}

export async function getVehicles(limit = 50, offset = 0) {
  const session = await auth();
  if (!session?.user) return [];

  try {
    const vehicleList = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.userId, session.user.id!))
      .limit(limit)
      .offset(offset);

    if (vehicleList.length === 0) return [];

    const vehicleIds = vehicleList.map((v) => v.id);

    const [allKir, allService, allStnk] = await Promise.all([
      db
        .select()
        .from(kirRecords)
        .where(inArray(kirRecords.vehicleId, vehicleIds))
        .orderBy(desc(kirRecords.startDate)),
      db
        .select()
        .from(serviceRecords)
        .where(inArray(serviceRecords.vehicleId, vehicleIds))
        .orderBy(desc(serviceRecords.serviceDate)),
      db
        .select()
        .from(stnkRecords)
        .where(inArray(stnkRecords.vehicleId, vehicleIds))
        .orderBy(desc(stnkRecords.startDate)),
    ]);

    return vehicleList.map((v) => ({
      ...v,
      kirRecords: allKir.filter((k) => k.vehicleId === v.id),
      serviceRecords: allService.filter((s) => s.vehicleId === v.id),
      stnkRecords: allStnk.filter((s) => s.vehicleId === v.id),
    }));
  } catch (error) {
    console.error("getVehicles:", error);
    return [];
  }
}

export async function getVehicle(id: string) {
  const session = await auth();
  if (!session?.user) return null;

  try {
    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, id));

    if (!vehicle || vehicle.userId !== session.user.id) return null;

    const [kirList, serviceList, stnkList] = await Promise.all([
      db
        .select()
        .from(kirRecords)
        .where(eq(kirRecords.vehicleId, id))
        .orderBy(desc(kirRecords.startDate))
        .limit(30),
      db
        .select()
        .from(serviceRecords)
        .where(eq(serviceRecords.vehicleId, id))
        .orderBy(desc(serviceRecords.serviceDate))
        .limit(30),
      db
        .select()
        .from(stnkRecords)
        .where(eq(stnkRecords.vehicleId, id))
        .orderBy(desc(stnkRecords.startDate))
        .limit(30),
    ]);

    return {
      ...vehicle,
      kirRecords: kirList,
      serviceRecords: serviceList,
      stnkRecords: stnkList,
    };
  } catch (error) {
    console.error("getVehicle:", error);
    return null;
  }
}
