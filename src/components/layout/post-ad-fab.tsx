"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

export function PostAdFab() {
  const pathname = usePathname();

  if (pathname === "/post-ad") return null;

  return (
    <Link
      href="/post-ad"
      aria-label="Post a new ad"
      className="fixed bottom-6 right-6 z-30 hidden items-center gap-2 rounded-full border border-amber-300 bg-amber-300 px-4 py-3 text-sm font-bold text-navy shadow-fab transition hover:-translate-y-0.5 hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 md:inline-flex"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Post Ad
    </Link>
  );
}
