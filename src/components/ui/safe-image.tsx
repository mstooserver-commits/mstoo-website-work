"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src?: string;
  alt: string;
  className?: string;
  fallback?: string;
};

export function SafeImage({ src, alt, className, fallback = "/logo.png" }: Props) {
  const [failed, setFailed] = useState(false);
  const url = !src || failed ? fallback : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
