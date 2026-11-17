"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, registerAction } from "@/app/actions/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-policy";
import { ShowcaseNotice } from "@/components/showcase-notice";
import { useStore } from "@/components/store-provider";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const router = useRouter();
  const { setSignedIn, showcase } = useStore();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isCreateAccount, setIsCreateAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setForm({ email: "", password: "", confirmPassword: "" });
    setError("");
    setIsCreateAccount(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");

    const email = form.email.trim();
    if (!email || !form.password) {
      setError("Please enter your email address and password");
      return;
    }

    // Quick checks for a friendlier form. The server validates again.
    if (isCreateAccount) {
      if (form.password.length < MIN_PASSWORD_LENGTH) {
        setError(`Use at least ${MIN_PASSWORD_LENGTH} characters for your password`);
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const credentials = { email, password: form.password };
      const result = isCreateAccount
        ? await registerAction(credentials)
        : await loginAction(credentials);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSignedIn(result.user);
      handleOpenChange(false);
      if (result.user.role === "admin") router.push("/admin");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isCreateAccount ? "Create an account" : "Sign in"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isCreateAccount
              ? "Create a Jaatland account with an email and password."
              : "Sign in to your Jaatland account to view your orders."}
          </DialogDescription>
        </DialogHeader>

        {showcase && <ShowcaseNotice />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">Password</Label>
            <Input
              id="user-password"
              type="password"
              autoComplete={
                isCreateAccount ? "new-password" : "current-password"
              }
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Enter password"
              required
            />
          </div>

          {isCreateAccount && (
            <div className="space-y-2">
              <Label htmlFor="user-confirm-password">Confirm Password</Label>
              <Input
                id="user-confirm-password"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Confirm password"
                required
              />
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || showcase}
          >
            {isSubmitting
              ? "Please wait…"
              : isCreateAccount
                ? "Create account"
                : "Sign in"}
          </Button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            {isCreateAccount ? "By creating an account you" : "You"} can read
            how we handle your data in our{" "}
            <Link href="/datenschutz" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsCreateAccount((prev) => !prev);
                setError("");
              }}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              {isCreateAccount
                ? "Already have an account? Sign in"
                : "New to Jaatland? Create an account"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
