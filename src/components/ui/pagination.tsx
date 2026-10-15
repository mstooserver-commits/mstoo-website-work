"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PageItem = number | "ellipsis-start" | "ellipsis-end";

function pageItems(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages: PageItem[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("ellipsis-start");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push("ellipsis-end");
  pages.push(total);
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  if (totalPages <= 1) return null;

  const buttonClass =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label="Listings pagination"
    >
      <button
        type="button"
        className={`${buttonClass} border-line bg-white px-3 text-ink hover:border-brand/40 hover:bg-brand-soft hover:text-brand`}
        disabled={disabled || currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="ml-1 hidden sm:inline">Previous</span>
      </button>

      {pageItems(currentPage, totalPages).map((item) =>
        typeof item === "number" ? (
          <button
            type="button"
            key={item}
            className={cn(
              buttonClass,
              item === currentPage
                ? "border-brand bg-brand text-white shadow-fab"
                : "border-line bg-white text-ink hover:border-brand/40 hover:bg-brand-soft hover:text-brand",
            )}
            disabled={disabled}
            onClick={() => onPageChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === currentPage ? "page" : undefined}
          >
            {item}
          </button>
        ) : (
          <span
            key={item}
            className="flex h-10 min-w-6 items-center justify-center text-muted"
            aria-hidden="true"
          >
            …
          </span>
        ),
      )}

      <button
        type="button"
        className={`${buttonClass} border-line bg-white px-3 text-ink hover:border-brand/40 hover:bg-brand-soft hover:text-brand`}
        disabled={disabled || currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <span className="mr-1 hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
