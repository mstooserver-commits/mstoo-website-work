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
import { INDIA_CITIES, type IndiaCity } from "@/lib/india-cities";

function unwrapPredictions(payload: unknown): PlacePrediction[] {
  if (Array.isArray(payload)) return payload as PlacePrediction[];
  const body = payload as {
    predictions?: PlacePrediction[];
    content?: { predictions?: PlacePrediction[] };
  };
  return body?.predictions || body?.content?.predictions || [];
}

async function fallbackSearch(query: string): Promise<PlacePrediction[]> {
  const response = await fetch(`/api/location?query=${encodeURIComponent(query)}`);
  if (!response.ok) return [];
  const rows = (await response.json()) as Array<{
    place_id?: string | number;
    display_name?: string;
    lat?: string;
    lon?: string;
    address?: { city?: string; town?: string; village?: string; state?: string };
  }>;
  return rows.map((row) => {
    const main = row.address?.city || row.address?.town || row.address?.village || row.display_name;
    return {
      place_id: `osm:${row.place_id}`,
      description: row.display_name,
      structured_formatting: { main_text: main, secondary_text: row.display_name },
      lat: Number(row.lat),
      lng: Number(row.lon),
    };
  });
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
  const [error, setError] = useState("");

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
        const predictions = unwrapPredictions(data);
        setResults(predictions.length ? predictions : await fallbackSearch(query.trim()));
      } catch {
        setResults(await fallbackSearch(query.trim()).catch(() => []));
      }
    }, 280);
    return () => clearTimeout(handle);
  }, [query]);

  const selectPlace = async (place: PlacePrediction) => {
    if (!place.place_id) return;
    setBusy(true);
    setError("");
    try {
      if (Number.isFinite(place.lat) && Number.isFinite(place.lng)) {
        await resolveFromCoords(
          Number(place.lat),
          Number(place.lng),
          place.description,
          place.structured_formatting?.main_text,
        );
        toast.success("Location updated");
        return;
      }
      const details = await locationApi.placeDetails(place.place_id);
      const parsed = extractPlaceLatLng(details);
      if (!parsed) throw new Error("Could not resolve that place");
      await resolveFromCoords(
        parsed.lat,
        parsed.lng,
        parsed.address || place.description,
        parsed.city || place.structured_formatting?.main_text,
      );
      toast.success("Location updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not set location";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const selectCity = async (city: IndiaCity) => {
    setBusy(true);
    setError("");
    try {
      await resolveFromCoords(city.lat, city.lng, `${city.name}, ${city.state}`, city.name);
      toast.success(`Location set to ${city.name}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not set location";
      setError(message);
      toast.error(message);
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

  const matchingCities = INDIA_CITIES.filter((city) =>
    `${city.name} ${city.state}`.toLowerCase().includes(query.trim().toLowerCase()),
  ).slice(0, query.trim() ? 8 : 6);

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
          <button
            type="button"
            disabled={busy}
            className="btn-secondary justify-start gap-2"
            onClick={geo}
          >
            <Navigation className="h-4 w-4 text-brand" />
            Use current location
          </button>
          <button
            type="button"
            disabled={busy}
            className="btn-secondary justify-start gap-2"
            onClick={fallback}
          >
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
        {results.length === 0 && matchingCities.length > 0 ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {query.trim() ? "Matching cities" : "Popular cities"}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {matchingCities.map((city) => (
                <button
                  key={`${city.name}-${city.state}`}
                  type="button"
                  disabled={busy}
                  onClick={() => void selectCity(city)}
                  className="rounded-lg border border-line px-3 py-2 text-left text-sm hover:border-brand hover:bg-brand-soft"
                >
                  <span className="block font-semibold">{city.name}</span>
                  <span className="text-xs text-muted">{city.state}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        ) : null}
        {busy ? <p className="mt-3 text-center text-sm text-muted">Updating zone…</p> : null}
      </div>
    </div>
  );
}
