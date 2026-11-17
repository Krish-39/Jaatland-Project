import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { sessions, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

// Everything stored about the signed-in user, as a JSON download
// (GDPR Art. 15 and 20). The password hash and session ids are left out:
// they are credentials, not information about the person.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const db = await getDb();
  const [account] = await db
    .select({ email: users.email, role: users.role, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, user.id));
  const activeSessions = await db
    .select({ createdAt: sessions.createdAt, expiresAt: sessions.expiresAt })
    .from(sessions)
    .where(eq(sessions.userId, user.id));

  const body = JSON.stringify(
    { exportedAt: new Date().toISOString(), account, sessions: activeSessions },
    null,
    2
  );

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="jaatland-account-data.json"',
      "Cache-Control": "no-store",
    },
  });
}
