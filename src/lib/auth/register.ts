"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { error: "Email sudah terdaftar." };
  }

  const hashed = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    email,
    password: hashed,
    name: name || null,
  });

  await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  return { success: true };
}
