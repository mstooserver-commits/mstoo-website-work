"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LocateFixed, MapPin, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addressApi, locationApi } from "@/lib/api";
import { extractPlaceLatLng, useLocationStore } from "@/lib/stores/location";
import { useAuthStore } from "@/lib/stores/auth";
import { MapPicker } from "@/components/location/map-picker";
import type { Address, Paginated, PlacePrediction } from "@/types";

function list(payload: unknown): Address[] {
  if (Array.isArray(payload)) return payload as Address[];
  return ((payload as Paginated<Address>)?.data || []) as Address[];
}

function predictions(payload: unknown): PlacePrediction[] {
  if (Array.isArray(payload)) return payload as PlacePrediction[];
  const body = payload as { predictions?: PlacePrediction[]; content?: { predictions?: PlacePrediction[] } };
  return body?.predictions || body?.content?.predictions || [];
}

async function fallbackSearch(query: string): Promise<PlacePrediction[]> {
  const response = await fetch(`/api/location?query=${encodeURIComponent(query)}`);
  if (!response.ok) return [];
  const rows = (await response.json()) as Array<{ place_id?: string | number; display_name?: string; lat?: string; lon?: string; address?: { city?: string; town?: string; village?: string } }>;
  return rows.map((row) => ({
    place_id: `osm:${row.place_id}`,
    description: row.display_name,
    structured_formatting: { main_text: row.address?.city || row.address?.town || row.address?.village || row.display_name, secondary_text: row.display_name },
    lat: Number(row.lat),
    lng: Number(row.lon),
  }));
}

async function reverse(lat: number, lng: number) {
  try {
    const response = await fetch(`/api/location?lat=${lat}&lng=${lng}`);
    if (!response.ok) return null;
    return (await response.json()) as { display_name?: string; address?: { city?: string; town?: string; village?: string; state?: string; postcode?: string; country?: string; road?: string } };
  } catch {
    return null;
  }
}

export default function AddressPage() {
  const loc = useLocationStore((s) => s.location);
  const user = useAuthStore((s) => s.user);
  const q = useQuery({ queryKey: ["addresses"], queryFn: () => addressApi.list() });
  const items = list(q.data);
  const [address, setAddress] = useState(loc?.address || "");
  const [name, setName] = useState(user?.first_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [label, setLabel] = useState("home");
  const [city, setCity] = useState(loc?.city || "");
  const [country, setCountry] = useState("India");
  const [street, setStreet] = useState("");
  const [zip, setZip] = useState("");
  const [lat, setLat] = useState(loc?.lat || 28.6139);
  const [lng, setLng] = useState(loc?.lng || 77.209);
  const [results, setResults] = useState<PlacePrediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const text = address.trim();
    if (text.length < 3) { setResults([]); return; }
    const handle = window.setTimeout(async () => {
      setSearching(true);
      try {
        const found = predictions(await locationApi.autocomplete(text));
        setResults(found.length ? found : await fallbackSearch(text));
      } catch {
        setResults(await fallbackSearch(text).catch(() => []));
      } finally { setSearching(false); }
    }, 350);
    return () => window.clearTimeout(handle);
  }, [address]);

  const applyCoords = async (nextLat: number, nextLng: number, knownAddress?: string) => {
    setLat(nextLat); setLng(nextLng);
    const detail = await reverse(nextLat, nextLng);
    const parts = detail?.address;
    setAddress(knownAddress || detail?.display_name || `${nextLat.toFixed(6)}, ${nextLng.toFixed(6)}`);
    setCity(parts?.city || parts?.town || parts?.village || "");
    setCountry(parts?.country || "India");
    setStreet(parts?.road || "");
    setZip(parts?.postcode || "");
    setResults([]);
  };

  const selectPlace = async (place: PlacePrediction) => {
    try {
      if (Number.isFinite(place.lat) && Number.isFinite(place.lng)) return void await applyCoords(Number(place.lat), Number(place.lng), place.description);
      if (!place.place_id) return;
      const parsed = extractPlaceLatLng(await locationApi.placeDetails(place.place_id));
      if (!parsed) throw new Error("Could not resolve this address");
      await applyCoords(parsed.lat, parsed.lng, parsed.address || place.description);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not select address"); }
  };

  const currentLocation = () => {
    if (!navigator.geolocation) return toast.error("Location is not supported by this browser");
    navigator.geolocation.getCurrentPosition(
      (position) => void applyCoords(position.coords.latitude, position.coords.longitude),
      () => toast.error("Allow location access and try again"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const add = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim() || !zip.trim()) return toast.error("Complete all required address fields");
    setSaving(true);
    try {
      const zone = await locationApi.zone(lat, lng);
      if (!(zone as { id?: string }).id) throw new Error("This area is not serviceable");
      await addressApi.create({
        address_type: "service", address_label: label,
        contact_person_name: name.trim(), contact_person_number: phone.trim(),
        address: address.trim(), lat: String(lat), lon: String(lng), city: city.trim(),
        zip_code: zip.trim(), country: country.trim(), street: street.trim(),
        zone_id: (zone as { id: string }).id,
      });
      toast.success("Address saved");
      setAddress(""); setStreet(""); setZip("");
      await q.refetch();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save address"); }
    finally { setSaving(false); }
  };

  return (
    <div className="container-page grid gap-6 py-8 lg:grid-cols-[.8fr_1.2fr]">
      <div>
        <h1 className="text-2xl font-bold">Saved addresses</h1>
        <p className="mt-1 text-sm text-muted">Addresses available in your account.</p>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={String(item.id)} className="card p-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-brand" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase text-brand">{item.address_label || item.address_type || "Address"}</p>
                  <p className="mt-1 font-medium">{item.address}</p>
                  <p className="mt-1 text-sm text-muted">{item.contact_person_name} · {item.contact_person_number}</p>
                </div>
                <button type="button" aria-label="Remove address" className="text-danger" onClick={async () => { if (!item.id || !window.confirm("Remove this address?")) return; await addressApi.remove([item.id]); await q.refetch(); }}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {!q.isLoading && !items.length ? <p className="card p-5 text-sm text-muted">No saved addresses yet.</p> : null}
        </div>
      </div>
      <form onSubmit={add} className="card space-y-4 p-5">
        <div><h2 className="text-lg font-semibold">Add new address</h2><p className="text-sm text-muted">Search or move the map pin to set an accurate location.</p></div>
        <MapPicker lat={lat} lng={lng} onChange={(a, b) => void applyCoords(a, b)} />
        <button type="button" className="btn-secondary w-full gap-2" onClick={currentLocation}><LocateFixed className="h-4 w-4 text-brand" /> Use current location</button>
        <div className="flex gap-2">{["home", "office", "others"].map((value) => <button key={value} type="button" onClick={() => setLabel(value)} className={label === value ? "btn-primary flex-1 capitalize" : "btn-secondary flex-1 capitalize"}>{value}</button>)}</div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted" />
          <input required className="input pl-9" placeholder="Search service address *" value={address} onChange={(e) => setAddress(e.target.value)} />
          {results.length ? <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-white p-1 shadow-card">{results.map((place) => <button key={place.place_id} type="button" className="flex w-full gap-2 rounded-lg p-3 text-left hover:bg-page" onClick={() => void selectPlace(place)}><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" /><span><span className="block text-sm font-medium">{place.structured_formatting?.main_text || place.description}</span><span className="block text-xs text-muted">{place.structured_formatting?.secondary_text || place.description}</span></span></button>)}</div> : null}
          {searching ? <span className="absolute right-3 top-3 text-xs text-muted">Searching…</span> : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Street / house" value={street} onChange={(e) => setStreet(e.target.value)} />
          <input required className="input" placeholder="City *" value={city} onChange={(e) => setCity(e.target.value)} />
          <input required className="input" inputMode="numeric" placeholder="PIN code *" value={zip} onChange={(e) => setZip(e.target.value)} />
          <input className="input" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
          <input required className="input" placeholder="Contact name *" value={name} onChange={(e) => setName(e.target.value)} />
          <input required className="input" inputMode="tel" placeholder="Phone *" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <button disabled={saving} className="btn-primary w-full">{saving ? "Saving…" : "Save address"}</button>
      </form>
    </div>
  );
}
