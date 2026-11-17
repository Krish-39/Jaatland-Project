import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/db";
import { sessions, users } from "@/db/schema";

export interface SessionUser {
  id: string;
  email: string;
  role: "customer" | "admin";
}

const SESSION_DAYS = 30;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";

// The __Host- prefix makes browsers refuse the cookie unless it is Secure,
// has Path=/ and no Domain, so a sibling subdomain cannot overwrite it.
const COOKIE_NAME = isProduction ? "__Host-jaatland_session" : "jaatland_session";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Creates a server-side session and sets the cookie. Server actions only. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MS);
  const db = await getDb();

  await db.insert(sessions).values({ id: hashToken(token), userId, expiresAt });
  // Opportunistic cleanup so expired rows do not pile up.
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Deletes the current session on the server and clears the cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (token) {
    const db = await getDb();
    await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  }
  store.delete(COOKIE_NAME);
}

/** The signed-in user, or null. Looked up at most once per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const db = await getDb();
  const rows = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return rows[0] ?? null;
});

export class NotAuthorizedError extends Error {
  constructor() {
    super("Not authorized");
    this.name = "NotAuthorizedError";
  }
}

/** Throws unless the current request belongs to an admin. Call this at the
 * top of every admin server action: hiding the UI is not access control. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (user?.role !== "admin") throw new NotAuthorizedError();
  return user;
}
