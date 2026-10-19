"use client";

import React, { useState } from "react";
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
import { ADMIN_EMAIL, ADMIN_PASSWORD, LS_KEYS } from "@/lib/mock-data";
import { readString, writeString } from "@/lib/storage";
import { useStore } from "@/components/store-provider";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const router = useRouter();
  const { login } = useStore();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isCreateAccount, setIsCreateAccount] = useState(false);

  const reset = () => {
    setForm({ email: "", password: "", confirmPassword: "" });
    setError("");
    setIsCreateAccount(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const email = form.email.trim();
    if (!email || !form.password) {
      setError("Please enter email and password");
      return;
    }

    if (isCreateAccount) {
      if (form.password.length < 6) {
        setError("Use at least 6 characters for your password");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      const existingEmail = readString(LS_KEYS.USER_EMAIL);
      if (existingEmail?.toLowerCase() === email.toLowerCase()) {
        setError("Account already exists. Please login instead.");
        return;
      }

      writeString(LS_KEYS.USER_EMAIL, email);
      writeString(LS_KEYS.USER_PASSWORD, form.password);
      login({ email });
      handleOpenChange(false);
      return;
    }

    if (email === ADMIN_EMAIL && form.password === ADMIN_PASSWORD) {
      writeString(LS_KEYS.ADMIN_EMAIL, email);
      handleOpenChange(false);
      router.push("/admin");
      return;
    }

    const storedEmail = readString(LS_KEYS.USER_EMAIL);
    const storedPassword = readString(LS_KEYS.USER_PASSWORD);

    if (
      storedEmail?.toLowerCase() === email.toLowerCase() &&
      storedPassword === form.password
    ) {
      login({ email: storedEmail });
      handleOpenChange(false);
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isCreateAccount ? "Create Account" : "User Login"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isCreateAccount
              ? "Create a Jaatland account with an email and password."
              : "Sign in to your Jaatland account to view your orders."}
          </DialogDescription>
        </DialogHeader>

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

          <Button type="submit" className="w-full">
            {isCreateAccount ? "Create Account" : "Login"}
          </Button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Demo store — accounts are stored only in this browser.
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
                ? "Already have an account? Login"
                : "Don't have an account? Create one"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
