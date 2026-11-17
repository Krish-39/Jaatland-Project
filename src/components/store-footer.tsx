"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUp, Check, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LEGAL_LINKS } from "@/lib/legal-config";
import { CATEGORIES, LS_KEYS } from "@/lib/mock-data";
import { writeString } from "@/lib/storage";
import { useFilters } from "@/components/filters-provider";
import { useStore } from "@/components/store-provider";

/** The shop's footer: rendered once in the root layout, on every page. */
export function StoreFooter() {
  const { setCategory } = useFilters();
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
    <footer className="border-t-2 border-ink bg-ink text-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div
          id="newsletter"
          className="scroll-mt-24 rounded-[2rem] border-2 border-[#1a1815] bg-brand p-6 text-[#1a1815] shadow-[8px_8px_0_0_var(--color-sticker)] md:p-10"
        >
          <div className="grid max-w-4xl grid-cols-1 items-center gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="font-display text-4xl md:text-5xl">
                {homepageConfig.newsletterTitle}
              </h2>
              <p className="mt-2 text-sm font-medium">
                {homepageConfig.newsletterSubtitle}
              </p>
            </div>

            <div aria-live="polite">
              {newsletterDone ? (
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Check className="h-5 w-5" />
                  Saved in this browser. Thank you for trying the demo.
                </div>
              ) : (
                <form className="space-y-2" onSubmit={subscribe}>
                  <div className="flex items-center gap-2">
                    <Input
                      className="border-[#1a1815] bg-[#fbf8f1] text-[#1a1815] placeholder:text-[#6b6357]"
                      type="email"
                      required
                      placeholder="you@example.com"
                      aria-label="Email address for newsletter"
                      value={newsletterEmail}
                      onChange={(event) =>
                        setNewsletterEmail(event.target.value)
                      }
                    />
                    <Button
                      type="submit"
                      className="border-[#1a1815] bg-[#1a1815] text-[#fbf8f1] [--shadow-ink:#fbf8f1]"
                    >
                      Subscribe
                    </Button>
                  </div>
                  <p className="text-xs">
                    Demo: your email is saved only in this browser and no
                    emails are sent. See our{" "}
                    <Link
                      href="/datenschutz"
                      className="underline underline-offset-2"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                  {newsletterError && (
                    <p role="alert" className="text-xs font-bold">
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
              <span className="grid size-9 place-items-center rounded-full border-2 border-background bg-brand text-[#1a1815]">
                <Shirt className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="font-display text-3xl">Jaatland</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-70">
              Everyday essentials, designed for comfort and a clean, modern fit.
            </p>
          </div>

          <div className="text-sm">
            <div className="font-display text-xl">Shop</div>
            <ul className="mt-3 space-y-2 opacity-80">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <button
                    type="button"
                    onClick={() => {
                      setCategory(category);
                      router.push("/#products");
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
            <div className="font-display text-xl">Account</div>
            <ul className="mt-3 space-y-2 opacity-80">
              <li>
                <button
                  type="button"
                  onClick={() => router.push("/orders")}
                  className="transition-opacity hover:opacity-100 hover:underline"
                >
                  Your orders
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
                    onClick={() => void logout()}
                    className="transition-opacity hover:opacity-100 hover:underline"
                  >
                    Sign out
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div className="text-sm">
            <div className="font-display text-xl">Help &amp; Legal</div>
            <ul className="mt-3 space-y-2 opacity-80">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-opacity hover:opacity-100 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-background/25 pt-6 text-xs opacity-75 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Jaatland Clothing Co. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <span>All prices incl. VAT, plus shipping</span>
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
