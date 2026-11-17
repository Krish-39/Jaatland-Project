"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Package, Settings, Trash2 } from "lucide-react";
import { deleteAccountAction } from "@/app/actions/account";
import { useStore } from "@/components/store-provider";
import { Button } from "@/components/ui/button";

export function AccountActions({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const { logout } = useStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (
      !confirm(
        "Delete your account permanently? Your login and account data will be erased. This cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError("");
    try {
      const result = await deleteAccountAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Clears the signed-in state everywhere in the UI, then leaves the page.
      await logout();
      router.push("/");
    } catch {
      setError("Could not delete your account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-8 space-y-8">
      <section className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => router.push("/orders")}>
          <Package className="h-4 w-4" /> Your orders
        </Button>
        {isAdmin && (
          <Button variant="outline" onClick={() => router.push("/admin")}>
            <Settings className="h-4 w-4" /> Admin dashboard
          </Button>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Your data</h2>
        <p className="mt-1 text-sm opacity-80">
          Download a copy of the data stored with your account, or erase the
          account. Details are in our{" "}
          <Link href="/datenschutz" className="underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <a href="/api/account/export" download>
              <Download className="h-4 w-4" /> Download my data
            </a>
          </Button>
          {!isAdmin && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting…" : "Delete my account"}
            </Button>
          )}
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
