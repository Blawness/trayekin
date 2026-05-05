import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { endpoint, keys } = await request.json();
  const { p256dh, auth: authKey } = keys;

  const [existing] = await db
    .select()
    .from(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, session.user.id!),
        eq(pushSubscriptions.endpoint, endpoint)
      )
    );

  if (!existing) {
    await db.insert(pushSubscriptions).values({
      userId: session.user.id!,
      endpoint,
      p256dh,
      auth: authKey,
    });
  }

  return NextResponse.json({ success: true });
}
