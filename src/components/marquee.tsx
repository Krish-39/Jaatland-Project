import { Fragment } from "react";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";

// Only statements the shop can stand behind: these are all true of this
// store. Do not add marketing claims here without checking them.
const ITEMS = [
  `Free shipping from €${FREE_SHIPPING_THRESHOLD}`,
  "14-day right of withdrawal",
  "All prices incl. VAT",
  "New collection",
  "Sizes XS to XXL",
];

/** Scrolling ticker strip. Duplicated once so the loop is seamless; the copy
 * is hidden from screen readers, and motion stops for reduced-motion users. */
export function Marquee() {
  const row = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-8 pr-8"
    >
      {ITEMS.map((item) => (
        <Fragment key={item}>
          <li className="font-display whitespace-nowrap text-2xl md:text-3xl">{item}</li>
          <li aria-hidden="true" className="text-2xl text-brand">
            ✶
          </li>
        </Fragment>
      ))}
    </ul>
  );

  return (
    <div className="overflow-hidden border-b-2 border-ink bg-ink py-3 text-background">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
