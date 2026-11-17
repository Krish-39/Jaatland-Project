"use client";

import Link from "next/link";
import { ArrowDownRight, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product-image";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import type { HomepageConfig } from "@/lib/types";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Circular rotating label, as a decorative stamp on the hero image. */
function SpinningStamp() {
  const label = "New collection • New collection • ";
  return (
    <div
      aria-hidden="true"
      className="absolute -top-8 left-2 z-10 grid size-24 place-items-center rounded-full border-2 border-ink bg-sticker text-[#1a1815] sm:size-28 md:-left-10 md:-top-10 md:size-32"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 animate-spin-slow">
        <defs>
          <path id="stamp-circle" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <text className="fill-current text-[9.5px] font-bold uppercase tracking-[0.18em]">
          <textPath href="#stamp-circle">{label}</textPath>
        </text>
      </svg>
      <ArrowDownRight className="h-8 w-8" />
    </div>
  );
}

export function Hero({ config }: { config: HomepageConfig }) {
  return (
    <section className="dot-grid relative overflow-hidden border-b-2 border-ink">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-12 md:grid-cols-[1.15fr_1fr] md:py-20">
        <div className="flex flex-col items-start">
          <span className="sticker">New collection</span>

          <h1 className="font-display mt-5 text-balance text-[clamp(3rem,8.5vw,7.25rem)]">
            {config.heroTitle}
          </h1>

          <p className="mt-6 max-w-prose text-pretty text-lg leading-relaxed text-slate-700 dark:text-slate-300">
            {config.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button size="lg" variant="brand" onClick={() => scrollTo("products")}>
              Shop the collection
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollTo("featured")}>
              View featured products
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium">
            <Link href="/versand-zahlung" className="flex items-center gap-2 hover:underline">
              <Truck className="h-4 w-4" aria-hidden="true" /> Free shipping from €
              {FREE_SHIPPING_THRESHOLD}
            </Link>
            <Link href="/widerruf" className="flex items-center gap-2 hover:underline">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> 14-day right of withdrawal
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          <SpinningStamp />
          <div className="relative aspect-[4/5] rotate-[1.5deg] overflow-hidden rounded-[2rem] border-2 border-ink bg-slate-200 shadow-[10px_10px_0_0_var(--shadow-ink)] transition-transform duration-500 hover:rotate-0">
            {config.heroImage && (
              <ProductImage
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                src={config.heroImage}
                alt="T-shirts in several colours on a clothes rail"
                priority
              />
            )}
          </div>
          <div className="absolute -bottom-5 right-4 rotate-[-2deg] rounded-2xl border-2 border-ink bg-background px-4 py-2 shadow-[4px_4px_0_0_var(--shadow-ink)]">
            <p className="font-display text-xl">New season</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              T-shirts, hoodies, joggers and accessories
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
