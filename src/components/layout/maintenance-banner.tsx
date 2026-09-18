"use client";

import { useConfigStore } from "@/lib/stores/config";
import { isFlagOn } from "@/lib/utils";

export function MaintenanceBanner() {
  const config = useConfigStore((s) => s.config);
  const on = isFlagOn(config?.maintenance_mode) || isFlagOn(config?.maintenance?.status);
  if (!on) return null;
  return (
    <div className="bg-navy px-4 py-2 text-center text-sm text-white">
      MSTOO is under maintenance. Some features may be unavailable.
    </div>
  );
}
