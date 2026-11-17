import Link from "next/link";
import { LEGAL_LINKS } from "@/lib/legal-config";

// Rendered by the root layout so the legal pages are one click away from
// every page, including checkout, orders, admin and the error screens.
export function LegalBar() {
  return (
    <nav
      aria-label="Legal"
      className="border-t border-background/25 bg-ink px-4 py-4 text-xs text-background/80"
    >
      <ul className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {LEGAL_LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
