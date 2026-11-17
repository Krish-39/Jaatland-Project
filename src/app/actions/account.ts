"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { isShowcaseMode, SHOWCASE_MESSAGE } from "@/db/url";
import { destroySession, getCurrentUser } from "@/lib/auth/session";
import { deleteOrdersForUser } from "@/lib/data/orders";

export type AccountResult = { ok: true } | { ok: false; error: string };

/** Erases the signed-in user's account (GDPR Art. 17). Sessions are removed
 * with the user through the foreign key's ON DELETE CASCADE. */
export async function deleteAccountAction(): Promise<AccountResult> {
  if (isShowcaseMode()) return { ok: false, error: SHOWCASE_MESSAGE };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You are not signed in." };

  if (user.role === "admin") {
    return {
      ok: false,
      error: "The admin account cannot be deleted here, so the shop is never left without an admin.",
    };
  }

  // Demo orders have no invoice or tax purpose, so they are erased with the
  // account. A live shop would have to keep invoices for the statutory period.
  await deleteOrdersForUser(user.id);

  const db = await getDb();
  await db.delete(users).where(eq(users.id, user.id));
  await destroySession();
  return { ok: true };
}
