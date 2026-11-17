"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { destroySession, getCurrentUser } from "@/lib/auth/session";

export type AccountResult = { ok: true } | { ok: false; error: string };

/** Erases the signed-in user's account (GDPR Art. 17). Sessions are removed
 * with the user through the foreign key's ON DELETE CASCADE. */
export async function deleteAccountAction(): Promise<AccountResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You are not signed in." };

  if (user.role === "admin") {
    return {
      ok: false,
      error: "The admin account cannot be deleted here, so the shop is never left without an admin.",
    };
  }

  const db = await getDb();
  await db.delete(users).where(eq(users.id, user.id));
  await destroySession();
  return { ok: true };
}
