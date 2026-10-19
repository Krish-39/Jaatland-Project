"use client";

import Image from "next/image";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HomepageConfig } from "@/lib/types";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function Hero({ config }: { config: HomepageConfig }) {
  return (
    <section className="border-b bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/30">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2 md:gap-12 md:py-16">
        <div className="flex flex-col items-start justify-center">
          <Badge className="w-fit" variant="secondary">
            <Sparkles className="mr-2 h-4 w-4" /> New Drop
          </Badge>
          <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight md:text-5xl">
            {config.heroTitle}
          </h1>
          <p className="mt-4 max-w-prose text-pretty text-base leading-relaxed opacity-80">
            {config.heroSubtitle}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => scrollTo("products")}>
              Shop the collection
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo("featured")}
            >
              View bestsellers
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" /> Free EU shipping €40+
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> 30-day returns
            </div>
          </div>
        </div>

        <div className="relative h-72 overflow-hidden rounded-3xl shadow-2xl md:h-[420px]">
          {config.heroImage && (
            <Image
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              src={config.heroImage}
              alt="Jaatland new season collection"
              priority
              loading="eager"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-black/15" />
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur dark:bg-slate-950/85">
            <p className="text-sm font-semibold">New season essentials</p>
            <p className="text-xs opacity-70">
              Limited batches · Ethically made · Ships worldwide
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
