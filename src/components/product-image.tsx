"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Shirt } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

// Renders a Shirt-icon placeholder when the product has no image URL,
// or when a remote image fails to load (e.g. dead/removed host).
export function ProductImage({
  src,
  alt,
  className,
  sizes,
  fill,
  width,
  height,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-gray-500",
          fill && "absolute inset-0",
          className
        )}
      >
        <Shirt className="h-1/3 w-1/3 max-h-16 max-w-16" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={fill ? sizes : undefined}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
