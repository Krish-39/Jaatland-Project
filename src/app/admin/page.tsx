import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin/admin-panel";
import { getCurrentUser } from "@/lib/auth/session";
import { getProducts } from "@/lib/data/catalog";
import { getOrderStats } from "@/lib/data/orders";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// The access check runs on the server, on every request, against the session
// stored in the database. Guests and customers never receive the admin UI.
export default async function AdminPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/");

  const [products, orderStats] = await Promise.all([getProducts(), getOrderStats()]);

  return <AdminPanel stats={{ productCount: products.length, ...orderStats }} />;
}
