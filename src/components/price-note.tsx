import Link from "next/link";
import { cn } from "@/lib/utils";

interface PriceNoteProps {
  className?: string;
  /** Render without the link, for use inside another link. */
  plain?: boolean;
}

// German price law (PAngV) requires every consumer price to state that VAT is
// included and whether shipping is charged on top, next to the price itself.
export function PriceNote({ className, plain = false }: PriceNoteProps) {
  return (
    <p className={cn("text-xs text-slate-500 dark:text-slate-400", className)}>
      incl. VAT, plus{" "}
      {plain ? (
        "shipping"
      ) : (
        <Link href="/versand-zahlung" className="underline underline-offset-2">
          shipping
        </Link>
      )}
    </p>
  );
}
