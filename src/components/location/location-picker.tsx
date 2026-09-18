"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { MapPin, Navigation, Search } from "lucide-react";
import { toast } from "sonner";
import { locationApi } from "@/lib/api";
import { DEFAULT_LOCATION } from "@/lib/constants";
import { extractPlaceLatLng, useLocationStore } from "@/lib/stores/location";
import type { PlacePrediction } from "@/types";
import { cn } from "@/lib/utils";

function unwrapPredictions(payload: unknown): PlacePrediction[] {
  if (Array.isArray(payload)) return payload as PlacePrediction[];
  const body = payload as { predictions?: PlacePrediction[]; content?: { predictions?: PlacePrediction[] } };
  return body?.predictions || body?.content?.predictions || [];
}

export function LocationPicker() {
  const pathname = usePathname();
  const open = useLocationStore((s) => s.pickerOpen);
  const setOpen = useLocationStore((s) => s.setPickerOpen);
  const location = useLocationStore((s) => s.location);
  const resolveFromCoords = useLocationStore((s) => s.resolveFromCoords);
  const requestBrowserLocation = useLocationStore((s) => s.requestBrowserLocation);
  const applyDefaultLocation = useLocationStore((s) => s.applyDefaultLocation);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<PlacePrediction[]>([]);

  const blocking =
    !location &&
    ["/", "/search", "/category", "/offers", "/providers"].some(
      (p) => pathname === p || (p !== "/" && pathname.startsWith(p)),
    );

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const data = await locationApi.autocomplete(query.trim());
        setResults(unwrapPredictions(data));
      } catch {
        setResults([]);
      }
    }, 280);
    return () => clearTimeout(handle);
  }, [query]);

  const selectPlace = async (place: PlacePrediction) => {
    if (!place.place_id) return;
    setBusy(true);
    try {
      const details = await locationApi.placeDetails(place.place_id);
      const parsed = extractPlaceLatLng(details);
      if (!parsed) throw new Error("Could not resolve that place");
      await resolveFromCoords(parsed.lat, parsed.lng, parsed.address || place.description);
      toast.success("Location updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not set location");
    } finally {
      setBusy(false);
    }
  };

  const geo = async () => {
    setBusy(true);
    try {
      await requestBrowserLocation();
      toast.success("Using your current location");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Location unavailable");
    } finally {
      setBusy(false);
    }
  };

  const fallback = async () => {
    setBusy(true);
    try {
      await applyDefaultLocation();
      toast.success("Showing ads for New Delhi");
    } finally {
      setBusy(false);
    }
  };

  const title = useMemo(
    () => (blocking ? "Select your location to continue" : "Change location"),
    [blocking],
  );

  if (!open && !blocking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 sm:max-w-lg sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-1 text-sm text-muted">
              MSTOO listings are zone-based. Ads and services will refresh for the area you pick.
            </p>
          </div>
          {location ? (
            <button type="button" className="text-sm text-muted" onClick={() => setOpen(false)}>
              Close
            </button>
          ) : null}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search area, city, landmark..."
            className="input pl-9"
            autoFocus
          />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" disabled={busy} className="btn-secondary justify-start gap-2" onClick={geo}>
            <Navigation className="h-4 w-4 text-brand" />
            Use current location
          </button>
          <button type="button" disabled={busy} className="btn-secondary justify-start gap-2" onClick={fallback}>
            <MapPin className="h-4 w-4 text-brand" />
            {DEFAULT_LOCATION.address}
          </button>
        </div>

        <ul className="mt-4 divide-y divide-line">
          {results.map((place) => (
            <li key={place.place_id}>
              <button
                type="button"
                disabled={busy}
                onClick={() => selectPlace(place)}
                className={cn("flex w-full items-start gap-2 py-3 text-left hover:bg-page")}
              >
                <MapPin className="mt-0.5 h-4 w-4 text-brand" />
                <span>
                  <span className="block text-sm font-medium">
                    {place.structured_formatting?.main_text || place.description}
                  </span>
                  <span className="text-xs text-muted">
                    {place.structured_formatting?.secondary_text || place.description}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {busy ? <p className="mt-3 text-center text-sm text-muted">Updating zone…</p> : null}
      </div>
    </div>
  );
}
