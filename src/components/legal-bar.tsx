import Link from "next/link";
import { LEGAL_LINKS } from "@/lib/legal-config";

// Rendered by the root layout so the legal pages are one click away from
// every page, including checkout, orders, admin and the error screens.
export function LegalBar() {
  return (
    <nav
      aria-label="Legal"
      className="border-t bg-muted/50 px-4 py-4 text-xs text-muted-foreground"
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
