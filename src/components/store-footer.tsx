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
    <footer className="border-t bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
        <div
          id="newsletter"
          className="scroll-mt-24 border-b pb-12"
        >
          <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-2 md:gap-12">
            <div>
              <h2 className="font-display text-2xl md:text-3xl">
                {homepageConfig.newsletterTitle}
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {homepageConfig.newsletterSubtitle}
              </p>
            </div>

            <div aria-live="polite">
              {newsletterDone ? (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Check className="h-5 w-5" />
                  Saved in this browser. Thank you for trying the demo.
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
                    <Button type="submit" className="h-11 px-5">
                      Subscribe
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
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
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {newsletterError}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Shirt className="h-5 w-5" aria-hidden="true" />
              <span className="text-[1.05rem] font-semibold uppercase tracking-[0.22em]">
                Jaatland
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Everyday essentials, designed for comfort and a clean, modern fit.
            </p>
          </div>

          <div className="text-sm">
            <div className="eyebrow">Shop</div>
            <ul className="mt-4 space-y-2.5 text-muted-foreground">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <button
                    type="button"
                    onClick={() => {
                      setCategory(category);
                      router.push("/#products");
                    }}
                    className="transition-colors hover:text-foreground"
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-sm">
            <div className="eyebrow">Account</div>
            <ul className="mt-4 space-y-2.5 text-muted-foreground">
              <li>
                <button
                  type="button"
                  onClick={() => router.push("/orders")}
                  className="transition-colors hover:text-foreground"
                >
                  Your orders
                </button>
              </li>
              <li>
                <a
                  href="#newsletter"
                  className="transition-colors hover:text-foreground"
                >
                  Newsletter
                </a>
              </li>
              {user && (
                <li>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="transition-colors hover:text-foreground"
                  >
                    Sign out
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div className="text-sm">
            <div className="eyebrow">Help &amp; Legal</div>
            <ul className="mt-4 space-y-2.5 text-muted-foreground">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
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
