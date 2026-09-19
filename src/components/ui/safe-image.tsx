"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | string[] | null;
  alt: string;
  className?: string;
  fallback?: string;
};

export function SafeImage({ src, alt, className, fallback = "/logo.png" }: Props) {
  const candidates = useMemo(() => {
    const list = Array.isArray(src) ? src : [src];
    return list.map((item) => (item || "").trim()).filter(Boolean);
  }, [src]);
  const key = candidates.join("|");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [key]);

  const exhausted = index >= candidates.length;
  const url = exhausted ? fallback : candidates[index];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url || fallback}
      alt={alt}
      className={cn("object-cover", className)}
      onError={() => {
        setIndex((current) => (current < candidates.length ? current + 1 : current));
      }}
      loading="lazy"
    />
  );
}
