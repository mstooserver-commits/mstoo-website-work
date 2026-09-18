"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, PlusCircle, CalendarDays, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/stores/cart";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/post-ad", label: "Post", icon: PlusCircle, accent: true },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/saved", label: "Saved", icon: Heart },
];

export function BottomNav() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.items.length);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-2 py-1 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px]",
                  active ? "text-brand" : "text-muted",
                  item.accent && "text-navy",
                )}
              >
                <span className="relative">
                  <Icon className={cn("h-5 w-5", item.accent && "text-post-dark")} />
                  {item.href === "/cart" && cartCount > 0 ? (
                    <span className="absolute -right-2 -top-1 rounded-full bg-brand px-1 text-[9px] text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
