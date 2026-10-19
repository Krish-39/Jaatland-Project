"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  Check,
  Facebook,
  Instagram,
  Shirt,
  X as XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES, LS_KEYS } from "@/lib/mock-data";
import { writeString } from "@/lib/storage";
import { useStore } from "@/components/store-provider";

interface StoreFooterProps {
  onSelectCategory: (category: string) => void;
}

export function StoreFooter({ onSelectCategory }: StoreFooterProps) {
  const router = useRouter();
  const { homepageConfig, user, logout } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");

  const subscribe = (event: React.FormEvent) => {
    event.preventDefault();
    const email = newsletterEmail.trim();
    if (!email) return;

    if (!writeString(LS_KEYS.NEWSLETTER, email)) {
      setNewsletterError(
        "Could not save your email. Check that browser storage is enabled."
      );
      return;
    }

    setNewsletterError("");
    setNewsletterDone(true);
    setNewsletterEmail("");
  };

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="border-t bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/20">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div
          id="newsletter"
          className="scroll-mt-24 rounded-3xl border bg-white p-6 shadow-sm dark:bg-slate-950 md:p-10"
        >
          <div className="grid max-w-4xl grid-cols-1 items-center gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {homepageConfig.newsletterTitle}
              </h2>
              <p className="mt-1 text-sm opacity-80">
                {homepageConfig.newsletterSubtitle}
              </p>
            </div>

            <div aria-live="polite">
              {newsletterDone ? (
                <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                  <Check className="h-5 w-5" />
                  You&apos;re on the list. Welcome to the club!
                </div>
              ) : (
                <form className="space-y-2" onSubmit={subscribe}>
                  <div className="flex items-center gap-2">
                    <Input
                      type="email"
                      required
                      placeholder="you@example.com"
                      aria-label="Email address for newsletter"
                      value={newsletterEmail}
                      onChange={(event) =>
                        setNewsletterEmail(event.target.value)
                      }
                    />
                    <Button type="submit">Subscribe</Button>
                  </div>
                  <p className="text-xs opacity-60">
                    Early access to drops. No spam — unsubscribe anytime.
                  </p>
                  {newsletterError && (
                    <p role="alert" className="text-xs text-red-600">
                      {newsletterError}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Shirt className="h-5 w-5" />
              <span className="font-extrabold">JAATLAND</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-70">
              Made with care in Europe. Sustainable fabrics, fair wages, and
              small-batch production.
            </p>
          </div>

          <div className="text-sm">
            <div className="font-semibold">Shop</div>
            <ul className="mt-3 space-y-2 opacity-80">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory(category);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="transition-opacity hover:opacity-100 hover:underline"
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-sm">
            <div className="font-semibold">Account</div>
            <ul className="mt-3 space-y-2 opacity-80">
              <li>
                <button
                  type="button"
                  onClick={() => router.push("/orders")}
                  className="transition-opacity hover:opacity-100 hover:underline"
                >
                  My Orders
                </button>
              </li>
              <li>
                <a
                  href="#newsletter"
                  className="transition-opacity hover:opacity-100 hover:underline"
                >
                  Newsletter
                </a>
              </li>
              {user && (
                <li>
                  <button
                    type="button"
                    onClick={logout}
                    className="transition-opacity hover:opacity-100 hover:underline"
                  >
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div className="text-sm">
            <div className="font-semibold">Follow</div>
            <div className="mt-3 flex items-center gap-3 opacity-80">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Jaatland on Instagram"
                className="rounded-md p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Jaatland on X"
                className="rounded-md p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              >
                <XIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Jaatland on Facebook"
                className="rounded-md p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs opacity-60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Jaatland Clothing Co. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <span>Demo store — no real payments are processed</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 hover:underline"
            >
              Back to top <ArrowUp className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
