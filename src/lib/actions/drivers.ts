"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { drivers } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function createDriver(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const simNumber = formData.get("simNumber") as string;
  const simExpiry = formData.get("simExpiry") as string;
  const notes = formData.get("notes") as string;

  if (!name) return { error: "Nama sopir wajib diisi." };

  await db.insert(drivers).values({
    userId: session.user.id!,
    name,
    phone: phone || null,
    simNumber: simNumber || null,
    simExpiry: simExpiry || null,
    notes: notes || null,
  });

  revalidatePath("/drivers");
  return { success: true };
}

export async function getDrivers() {
  const session = await auth();
  if (!session?.user) return [];

  return db
    .select()
    .from(drivers)
    .where(eq(drivers.userId, session.user.id!));
}

export async function getDriver(id: string) {
  const session = await auth();
  if (!session?.user) return null;

  const [driver] = await db
    .select()
    .from(drivers)
    .where(eq(drivers.id, id));

  if (!driver || driver.userId !== session.user.id) return null;
  return driver;
}

export async function updateDriver(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [driver] = await db
    .select()
    .from(drivers)
    .where(eq(drivers.id, id));

  if (!driver || driver.userId !== session.user.id) {
    return { error: "Sopir tidak ditemukan." };
  }

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const simNumber = formData.get("simNumber") as string;
  const simExpiry = formData.get("simExpiry") as string;
  const notes = formData.get("notes") as string;

  if (!name) return { error: "Nama sopir wajib diisi." };

  await db
    .update(drivers)
    .set({
      name,
      phone: phone || null,
      simNumber: simNumber || null,
      simExpiry: simExpiry || null,
      notes: notes || null,
    })
    .where(eq(drivers.id, id));

  revalidatePath("/drivers");
  revalidatePath(`/drivers/${id}`);
  return { success: true };
}

export async function deleteDriver(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [driver] = await db
    .select()
    .from(drivers)
    .where(eq(drivers.id, id));

  if (!driver || driver.userId !== session.user.id) {
    return { error: "Sopir tidak ditemukan." };
  }

  await db.delete(drivers).where(eq(drivers.id, id));
  revalidatePath("/drivers");
  return { success: true };
}
