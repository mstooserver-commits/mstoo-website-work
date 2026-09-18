"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth";
import { useConfigStore } from "@/lib/stores/config";
import { useLocationStore } from "@/lib/stores/location";
import { useCartStore } from "@/lib/stores/cart";

export function AppBootstrap() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const loadConfig = useConfigStore((s) => s.load);
  const hydrateLocation = useLocationStore((s) => s.hydrate);
  const location = useLocationStore((s) => s.location);
  const loadCart = useCartStore((s) => s.load);

  useEffect(() => {
    hydrateLocation();
    void loadConfig();
    void hydrateAuth();
  }, [hydrateAuth, hydrateLocation, loadConfig]);

  useEffect(() => {
    if (isLoggedIn) void loadCart();
  }, [isLoggedIn, loadCart]);

  useEffect(() => {
    const loc = useLocationStore.getState().location;
    if (loc) return;
    if (window.location.pathname !== "/") return;
    const { requestBrowserLocation, setPickerOpen } = useLocationStore.getState();
    requestBrowserLocation().catch(() => setPickerOpen(true));
  }, []);

  useEffect(() => {
    if (location) {
      /* listings refresh via react-query keys that include zoneId */
    }
  }, [location]);

  return null;
}
