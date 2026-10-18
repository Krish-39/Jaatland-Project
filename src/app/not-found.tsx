import Link from "next/link";
import { Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Shirt className="h-10 w-10" />
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="max-w-sm text-sm opacity-70">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Button asChild>
        <Link href="/">Back to store</Link>
      </Button>
    </div>
  );
}
