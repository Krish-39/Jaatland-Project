import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

// Tells the client who is signed in. Pages stay statically rendered and ask
// for this once after load, instead of every page reading the cookie.
export async function GET() {
  const user = await getCurrentUser();

  return NextResponse.json(
    { user: user ? { email: user.email, role: user.role } : null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
