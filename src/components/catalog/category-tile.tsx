"use client";

import Link from "next/link";
import { categoryImage } from "@/lib/media";
import { useConfigStore } from "@/lib/stores/config";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { SafeImage } from "@/components/ui/safe-image";

export function CategoryTile({
  category,
  href,
  active,
  compact,
}: {
  category: Category;
  href: string;
  active?: boolean;
  compact?: boolean;
}) {
  const imageBase = useConfigStore((s) => s.config?.image_base_url);
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border bg-white p-3 text-center shadow-soft transition hover:border-brand/40",
        active ? "border-brand bg-brand-soft" : "border-line",
        compact ? "min-w-[92px] shrink-0 p-2" : "",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-xl bg-brand-soft",
          compact ? "h-12 w-12" : "h-14 w-14",
        )}
      >
        <SafeImage
          src={categoryImage(category, imageBase)}
          alt={category.name}
          className={cn("object-contain", compact ? "h-10 w-10" : "h-12 w-12")}
        />
      </span>
      <span className={cn("line-clamp-2 font-medium text-ink", compact ? "text-[11px]" : "text-xs")}>
        {category.name}
      </span>
    </Link>
  );
}
