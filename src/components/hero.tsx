"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product-image";
import type { HomepageConfig } from "@/lib/types";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero({ config }: { config: HomepageConfig }) {
  return (
    <section className="border-b">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 md:grid-cols-2 md:gap-16 md:py-20 lg:px-8">
        <div className="order-2 flex flex-col items-start md:order-1">
          <p className="eyebrow text-muted-foreground">New collection</p>
          <h1 className="font-display mt-4 max-w-xl text-balance text-4xl sm:text-5xl lg:text-6xl">
            {config.heroTitle}
          </h1>
          <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            {config.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => scrollTo("products")}>
              Shop the collection
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollTo("featured")}>
              View featured products
            </Button>
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted sm:aspect-[5/4] md:aspect-[4/5]">
            {config.heroImage && (
              <ProductImage
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                src={config.heroImage}
                alt="T-shirts in several colours on a clothes rail"
                priority
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
