import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AccountActions } from "@/components/account-actions";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  return (
    <div className="min-h-[60vh] bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to store
        </Link>

        <h1 className="font-display text-3xl md:text-4xl">Your account</h1>

        <dl className="mt-6 space-y-3 rounded-lg border p-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="opacity-70">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="opacity-70">Account type</dt>
            <dd className="font-medium">
              {user.role === "admin" ? "Administrator" : "Customer"}
            </dd>
          </div>
        </dl>

        <AccountActions isAdmin={user.role === "admin"} />
      </main>
    </div>
  );
}
