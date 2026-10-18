"use client";

import { Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Shirt className="h-10 w-10" />
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="max-w-sm text-sm opacity-70">
        An unexpected error occurred{error.digest ? ` (ref ${error.digest})` : ""}. Try again, or
        head back to the store.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
