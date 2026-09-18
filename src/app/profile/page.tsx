"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth";
import { useConfigStore } from "@/lib/stores/config";
import { isFlagOn } from "@/lib/utils";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Landmark,
  LogOut,
  MapPin,
  Shield,
  Star,
  Store,
  UserRound,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const config = useConfigStore((s) => s.config);

  const links = [
    { href: "/profile/edit", label: "Edit profile", icon: UserRound },
    { href: "/address", label: "Addresses", icon: MapPin },
    { href: "/bookings", label: "Bookings", icon: Star },
    { href: "/notifications", label: "Notifications", icon: Bell },
    ...(isFlagOn(config?.wallet_status) || isFlagOn(config?.wallet_payment)
      ? [{ href: "/wallet", label: "Wallet", icon: Wallet }]
      : []),
    ...(isFlagOn(config?.loyalty_point_status) ? [{ href: "/points", label: "Loyalty points", icon: Star }] : []),
    ...(isFlagOn(config?.pro_member?.enabled) ? [{ href: "/pro-member", label: "Pro Member", icon: Shield }] : []),
    { href: "/coupons", label: "Coupons", icon: CreditCard },
    { href: "/my-ads", label: "My ads", icon: Store },
    { href: "/provider/requests", label: "Booking requests", icon: Store },
    { href: "/provider/bank", label: "Bank info", icon: Landmark },
    { href: "/provider/withdraw", label: "Withdraw", icon: Wallet },
    { href: "/provider/reports", label: "Reports", icon: CreditCard },
  ];

  return (
    <div className="container-page py-8">
      <div className="card p-5">
        <h1 className="text-2xl font-bold">
          {user?.first_name} {user?.last_name}
        </h1>
        <p className="text-sm text-muted">{user?.phone}</p>
        <p className="text-sm text-muted">{user?.email}</p>
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-white">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center justify-between border-b border-line px-4 py-3 last:border-0 hover:bg-page">
            <span className="flex items-center gap-3 text-sm font-medium">
              <l.icon className="h-4 w-4 text-brand" />
              {l.label}
            </span>
            <ChevronRight className="h-4 w-4 text-muted" />
          </Link>
        ))}
      </div>
      <button
        className="btn-secondary mt-6 w-full gap-2 text-danger"
        onClick={async () => {
          await logout();
          toast.success("Logged out");
          window.location.href = "/";
        }}
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  );
}
