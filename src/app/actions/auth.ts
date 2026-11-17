"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { firstIssue, loginSchema, registerSchema } from "@/lib/validation";

export interface AuthUser {
  email: string;
  role: "customer" | "admin";
}

export type AuthResult = { ok: true; user: AuthUser } | { ok: false; error: string };

// Per client and per targeted account, so neither one address nor one
// password list can be hammered. In memory, so per server instance.
const loginLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });
const accountLimiter = createRateLimiter({ limit: 10, windowMs: 15 * 60_000 });
const registerLimiter = createRateLimiter({ limit: 5, windowMs: 60_000 });

const TOO_MANY = "Too many attempts. Please wait a minute and try again.";

export async function loginAction(input: unknown): Promise<AuthResult> {
  const client = clientKey(await headers());
  if (!loginLimiter.check(client)) return { ok: false, error: TOO_MANY };

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { email, password } = parsed.data;

  if (!accountLimiter.check(email)) return { ok: false, error: TOO_MANY };

  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  // Always run one hash comparison, and answer identically for "no such
  // account" and "wrong password", so the form cannot be used to find out
  // which email addresses are registered.
  const valid = await verifyPassword(password, user?.passwordHash ?? (await DUMMY_PASSWORD_HASH));
  if (!user || !valid) return { ok: false, error: "Invalid email or password" };

  await createSession(user.id);
  return { ok: true, user: { email: user.email, role: user.role } };
}

export async function registerAction(input: unknown): Promise<AuthResult> {
  const client = clientKey(await headers());
  if (!registerLimiter.check(client)) return { ok: false, error: TOO_MANY };

  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { email, password } = parsed.data;

  const db = await getDb();
  const passwordHash = await hashPassword(password);
  const inserted = await db
    .insert(users)
    .values({ email, passwordHash, role: "customer" })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id, email: users.email, role: users.role });

  const user = inserted[0];
  if (!user) {
    return { ok: false, error: "An account with this email already exists. Please log in instead." };
  }

  await createSession(user.id);
  return { ok: true, user: { email: user.email, role: user.role } };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
}
