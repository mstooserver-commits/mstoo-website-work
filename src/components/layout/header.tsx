"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  Bell,
  Heart,
  MapPin,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { useCartStore } from "@/lib/stores/cart";
import { useLocationStore } from "@/lib/stores/location";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/offers", label: "Offers" },
  { href: "/providers", label: "Providers" },
  { href: "/post-ad", label: "Post Ad" },
];

export function Header() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const location = useLocationStore((s) => s.location);
  const setPickerOpen = useLocationStore((s) => s.setPickerOpen);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const cartCount = useCartStore((s) => s.items.length);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-page flex items-center gap-3 py-3">
        <Link href="/" className="shrink-0" aria-label="MSTOO home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MSTOO — Rent Lease & Hire" className="h-9 w-auto sm:h-10" />
        </Link>

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="hidden min-w-0 max-w-[220px] items-center gap-2 rounded-md border border-line px-3 py-2 text-left hover:bg-page md:flex"
        >
          <MapPin className="h-4 w-4 shrink-0 text-brand" />
          <span className="truncate text-xs">
            <span className="block font-semibold text-ink">Deliver to</span>
            <span className="text-muted">{location?.address || "Set location"}</span>
          </span>
        </button>

        <form onSubmit={onSearch} className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search rentals, services, ads..."
            className="input pl-9"
          />
        </form>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-brand-soft hover:text-brand",
                item.href === "/post-ad" && "bg-post text-navy hover:bg-post-dark hover:text-navy",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link href="/saved" className="rounded-md p-2 hover:bg-page" aria-label="Saved ads">
            <Heart className="h-5 w-5" />
          </Link>
          <Link href="/notifications" className="hidden rounded-md p-2 hover:bg-page sm:block" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Link>
          <Link href="/cart" className="relative rounded-md p-2 hover:bg-page" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link href={isLoggedIn ? "/profile" : "/login"} className="rounded-md p-2 hover:bg-page" aria-label="Account">
            <UserRound className="h-5 w-5" />
          </Link>
          <button type="button" className="rounded-md p-2 lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="flex w-full items-center gap-2 border-t border-line bg-page px-4 py-2 text-left md:hidden"
      >
        <MapPin className="h-4 w-4 text-brand" />
        <span className="truncate text-xs text-muted">{location?.address || "Set your location to see nearby ads"}</span>
      </button>

      {open ? (
        <div className="border-t border-line bg-white px-4 py-3 lg:hidden">
          <form onSubmit={onSearch} className="mb-3 md:hidden">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search MSTOO"
              className="input"
            />
          </form>
          <div className="flex flex-col">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="py-2 text-sm font-medium" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link href="/bookings" className="py-2 text-sm" onClick={() => setOpen(false)}>
              Bookings
            </Link>
            <p className="pt-2 text-xs text-muted">
              {isLoggedIn ? `Hi, ${user?.first_name || "there"}` : "Sign in to book, chat and post ads"}
            </p>
          </div>
        </div>
      ) : null}
    </header>
  );
}
