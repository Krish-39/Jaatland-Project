import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Explains why sign-in and checkout are unavailable when the deployment runs
// without a database. Kept in one place so the wording stays consistent.
export function ShowcaseNotice({ className }: { className?: string }) {
  return (
    <p
      role="status"
      className={cn(
        "flex items-start gap-2 rounded-md border bg-muted text-foreground p-3 text-sm",
        className
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        Accounts and checkout are not available in this deployment. You can
        still browse the catalog, use the cart and wishlist, and read the shop
        information pages.
      </span>
    </p>
  );
}
