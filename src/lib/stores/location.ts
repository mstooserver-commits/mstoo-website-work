import { create } from "zustand";
import { COOKIES, DEFAULT_LOCATION, STORAGE_KEYS } from "@/lib/constants";
import { locationApi } from "@/lib/api";
import type { SavedLocation, Zone } from "@/types";
import { nearestIndiaCity } from "@/lib/india-cities";

type LocationState = {
  location: SavedLocation | null;
  ready: boolean;
  denied: boolean;
  pickerOpen: boolean;
  setPickerOpen: (open: boolean) => void;
  hydrate: () => void;
  setLocation: (location: SavedLocation) => void;
  resolveFromCoords: (
    lat: number,
    lng: number,
    address?: string,
    city?: string,
  ) => Promise<SavedLocation>;
  requestBrowserLocation: () => Promise<SavedLocation>;
  applyDefaultLocation: () => Promise<SavedLocation>;
};

function persistCookies(location: SavedLocation) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 30;
  document.cookie = `${COOKIES.zone}=${encodeURIComponent(location.zoneId)}; path=/; max-age=${maxAge}; samesite=lax`;
  document.cookie = `${COOKIES.location}=${encodeURIComponent(JSON.stringify(location))}; path=/; max-age=${maxAge}; samesite=lax`;
}

function readStored(): SavedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.location);
    if (raw) {
      const parsed = JSON.parse(raw) as SavedLocation;
      if (parsed?.zoneId && parsed.lat && parsed.lng) return parsed;
    }
  } catch {
    /* ignore */
  }
  try {
    const match = document.cookie.split("; ").find((row) => row.startsWith(`${COOKIES.location}=`));
    if (!match) return null;
    const parsed = JSON.parse(
      decodeURIComponent(match.split("=").slice(1).join("=")),
    ) as SavedLocation;
    if (parsed?.zoneId && parsed.lat && parsed.lng) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function parseGeocode(payload: unknown): { address: string; city?: string } {
  const body = payload as {
    results?: {
      formatted_address?: string;
      address_components?: { long_name?: string; types?: string[] }[];
    }[];
    content?: {
      results?: {
        formatted_address?: string;
        address_components?: { long_name?: string; types?: string[] }[];
      }[];
      formatted_address?: string;
    };
    formatted_address?: string;
  };
  const result = body?.results?.[0] || body?.content?.results?.[0];
  const address =
    result?.formatted_address || body?.content?.formatted_address || body?.formatted_address || "";
  const city = result?.address_components?.find((component) =>
    component.types?.some((type) =>
      ["locality", "postal_town", "administrative_area_level_2"].includes(type),
    ),
  )?.long_name;
  return { address, city };
}

async function fallbackReverseGeocode(lat: number, lng: number) {
  const response = await fetch(`/api/location?lat=${lat}&lng=${lng}`);
  if (!response.ok) return { address: "", city: "" };
  const body = (await response.json()) as {
    display_name?: string;
    address?: { city?: string; town?: string; village?: string; county?: string };
  };
  return {
    address: body.display_name || "",
    city:
      body.address?.city || body.address?.town || body.address?.village || body.address?.county || "",
  };
}

function parsePlaceLatLng(
  payload: unknown,
): { lat: number; lng: number; address?: string; city?: string } | null {
  const root = payload as Record<string, unknown>;
  const content = (root?.content ?? root) as Record<string, unknown>;
  const result = (content?.result ?? content) as Record<string, unknown>;
  const geometry = (result?.geometry ?? content?.geometry) as
    { location?: { lat?: number; lng?: number } } | undefined;
  const loc = geometry?.location;
  const lat = Number(loc?.lat);
  const lng = Number(loc?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const address =
    (result?.formatted_address as string) || (content?.formatted_address as string) || undefined;
  const components = (result?.address_components ?? content?.address_components) as
    { long_name?: string; types?: string[] }[] | undefined;
  const city = components?.find((component) =>
    component.types?.some((type) =>
      ["locality", "postal_town", "administrative_area_level_2"].includes(type),
    ),
  )?.long_name;
  return { lat, lng, address, city };
}

export const useLocationStore = create<LocationState>((set, get) => ({
  location: null,
  ready: false,
  denied: false,
  pickerOpen: false,
  setPickerOpen: (open) => set({ pickerOpen: open }),
  hydrate: () => {
    const stored = readStored();
    if (stored) {
      persistCookies(stored);
      set({ location: stored, ready: true, denied: false });
    } else {
      set({ ready: false });
    }
  },
  setLocation: (location) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.location, JSON.stringify(location));
    }
    persistCookies(location);
    set({ location, ready: true, denied: false, pickerOpen: false });
  },
  resolveFromCoords: async (lat, lng, address, suppliedCity) => {
    const zone = (await locationApi.zone(lat, lng)) as Zone;
    let resolvedAddress = address ?? "";
    let city = suppliedCity ?? "";
    if (!resolvedAddress) {
      try {
        const geo = await locationApi.geocode(lat, lng);
        const parsed = parseGeocode(geo);
        const fallback = parsed.address ? null : await fallbackReverseGeocode(lat, lng);
        resolvedAddress = parsed.address || fallback?.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        city = parsed.city || fallback?.city || "";
      } catch {
        const fallback = await fallbackReverseGeocode(lat, lng).catch(() => null);
        resolvedAddress = fallback?.address || "";
        city = fallback?.city || "";
      }
    }
    if (!zone?.id) {
      throw new Error("This area is not currently serviceable. Pick another location.");
    }
    const nearest = nearestIndiaCity(lat, lng);
    if (!resolvedAddress || /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(resolvedAddress)) {
      resolvedAddress = `${nearest.name}, ${nearest.state}`;
      city = nearest.name;
    }
    const next: SavedLocation = {
      lat,
      lng,
      address: resolvedAddress,
      city: city || nearest.name || zone.name,
      zoneId: zone.id,
      zoneName: zone.name,
    };
    get().setLocation(next);
    try {
      const { useAuthStore } = await import("@/lib/stores/auth");
      if (useAuthStore.getState().isLoggedIn) {
        const { authApi } = await import("@/lib/api");
        await authApi.updateZone();
      }
    } catch {
      /* optional */
    }
    return next;
  },
  requestBrowserLocation: () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        set({ denied: true, pickerOpen: true });
        reject(new Error("Geolocation is not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const loc = await get().resolveFromCoords(pos.coords.latitude, pos.coords.longitude);
            resolve(loc);
          } catch (err) {
            set({ pickerOpen: true });
            reject(err);
          }
        },
        () => {
          set({ denied: true, pickerOpen: true });
          reject(new Error("Location permission denied"));
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
      );
    }),
  applyDefaultLocation: async () => {
    return get().resolveFromCoords(
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lng,
      DEFAULT_LOCATION.address,
    );
  },
}));

export function extractPlaceLatLng(payload: unknown) {
  return parsePlaceLatLng(payload);
}
