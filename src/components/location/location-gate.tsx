"use client";

import { usePathname } from "next/navigation";
import { useLocationStore } from "@/lib/stores/location";

const BLOCKING = ["/", "/search", "/category", "/offers", "/providers"];

export function LocationGate() {
  const pathname = usePathname();
  const location = useLocationStore((s) => s.location);
  const pickerOpen = useLocationStore((s) => s.pickerOpen);
  const needsZone = BLOCKING.some((p) => pathname === p || (p !== "/" && pathname.startsWith(p)));
  if (!needsZone || location || pickerOpen) return null;
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-white/80">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="mt-3 text-sm text-muted">Detecting your location…</p>
      </div>
    </div>
  );
}
