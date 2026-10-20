"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { FilePlus2, Layers3, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PostAdChooser({
  children = "Post Ad",
  className,
  onOpen,
  ariaLabel,
}: {
  children?: ReactNode;
  className?: string;
  onOpen?: () => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={ariaLabel}
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
      >
        {children}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="post-ad-choice-title"
          onMouseDown={(event) => event.target === event.currentTarget && close()}
        >
          <div className="w-full rounded-t-2xl bg-white p-5 shadow-card sm:max-w-md sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="post-ad-choice-title" className="text-xl font-bold">
                  Post an ad
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Choose one detailed ad or publish several ads together.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-full p-2 hover:bg-page"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                href="/post-ad"
                onClick={close}
                className={cn(
                  "rounded-xl border border-line p-4 transition hover:border-brand hover:bg-brand-soft",
                )}
              >
                <FilePlus2 className="h-7 w-7 text-brand" />
                <span className="mt-3 block font-bold">Single ad</span>
                <span className="mt-1 block text-sm text-muted">
                  Post one ad with complete specifications.
                </span>
              </Link>
              <Link
                href="/bulk-post"
                onClick={close}
                className="rounded-xl border border-line p-4 transition hover:border-brand hover:bg-brand-soft"
              >
                <Layers3 className="h-7 w-7 text-brand" />
                <span className="mt-3 block font-bold">Bulk ads</span>
                <span className="mt-1 block text-sm text-muted">Add and publish up to 10 ads.</span>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
