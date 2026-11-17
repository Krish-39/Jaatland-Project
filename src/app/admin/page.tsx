import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin/admin-panel";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// The access check runs on the server, on every request, against the session
// stored in the database. Guests and customers never receive the admin UI.
export default async function AdminPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/");

  return <AdminPanel />;
}
