"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { vehicles, kirRecords, serviceRecords } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { addMonths } from "@/lib/utils/status";
import { eq } from "drizzle-orm";

export async function createVehicle(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const plate = formData.get("plate") as string;
  const name = formData.get("name") as string;
  const kirStartStr = formData.get("kir_start_date") as string;
  const serviceDateStr = formData.get("service_date") as string;

  if (!plate) return { error: "Nomor polisi wajib diisi." };

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
      endDate: addMonths(startDate, 6).toISOString().split("T")[0],
    });
  }

  if (serviceDateStr) {
    const serviceDate = new Date(serviceDateStr);
    await db.insert(serviceRecords).values({
      vehicleId: vehicle.id,
      serviceDate: serviceDate.toISOString().split("T")[0],
      type: "rutin",
      nextServiceDate: addMonths(serviceDate, 3).toISOString().split("T")[0],
    });
  }

  revalidatePath("/");
  revalidatePath("/vehicles");
  return { success: true, vehicleId: vehicle.id };
}

export async function getVehicles() {
  const session = await auth();
  if (!session?.user) return [];

  return db.query.vehicles.findMany({
    where: eq(vehicles.userId, session.user.id!),
    with: {
      kirRecords: { orderBy: (kir, { desc }) => [desc(kir.startDate)] },
      serviceRecords: {
        orderBy: (sr, { desc }) => [desc(sr.serviceDate)],
      },
    },
  });
}

export async function getVehicle(id: string) {
  const session = await auth();
  if (!session?.user) return null;

  const [vehicle] = await db.query.vehicles.findMany({
    where: eq(vehicles.id, id),
    with: {
      kirRecords: { orderBy: (kir, { desc }) => [desc(kir.startDate)] },
      serviceRecords: {
        orderBy: (sr, { desc }) => [desc(sr.serviceDate)],
      },
    },
  });

  if (!vehicle || vehicle.userId !== session.user.id) return null;
  return vehicle;
}
