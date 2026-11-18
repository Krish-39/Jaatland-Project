import Link from "next/link";
import { BadgeEuro, MapPin, RotateCcw, Truck } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";

// Only statements that are true of this store; each links to the page that
// states the details. Do not add claims here without checking them.
const ITEMS = [
  { icon: Truck, title: `Free shipping from €${FREE_SHIPPING_THRESHOLD}`, text: "€4.90 below that", href: "/versand-zahlung" },
  { icon: RotateCcw, title: "14-day right of withdrawal", text: "For consumers in the EU", href: "/widerruf" },
  { icon: BadgeEuro, title: "Prices include VAT", text: "No hidden charges at checkout", href: "/versand-zahlung" },
  { icon: MapPin, title: "Delivery within Germany", text: "Shipping details and costs", href: "/versand-zahlung" },
];

export function ServiceBar() {
  return (
    <section aria-label="Shopping information" className="border-b bg-muted/60">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-6 px-4 py-8 lg:grid-cols-4 lg:px-8">
        {ITEMS.map(({ icon: Icon, title, text, href }) => (
          <li key={title}>
            <Link href={href} className="group flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span>
                <span className="block text-sm font-medium group-hover:underline">{title}</span>
                <span className="block text-xs text-muted-foreground">{text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
