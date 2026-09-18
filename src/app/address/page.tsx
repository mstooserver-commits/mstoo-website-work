"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { addressApi, locationApi } from "@/lib/api";
import { useLocationStore } from "@/lib/stores/location";
import { MapPicker } from "@/components/location/map-picker";
import type { Address, Paginated } from "@/types";

function list(payload: unknown): Address[] {
  if (Array.isArray(payload)) return payload as Address[];
  return ((payload as Paginated<Address>)?.data || []) as Address[];
}

export default function AddressPage() {
  const loc = useLocationStore((s) => s.location);
  const q = useQuery({ queryKey: ["addresses"], queryFn: () => addressApi.list() });
  const items = list(q.data);
  const [address, setAddress] = useState(loc?.address || "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lat, setLat] = useState(loc?.lat || 28.6139);
  const [lng, setLng] = useState(loc?.lng || 77.209);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const zone = await locationApi.zone(lat, lng);
      await addressApi.create({
        address_type: "home",
        contact_person_name: name,
        contact_person_number: phone,
        address,
        latitude: String(lat),
        longitude: String(lng),
        zone_id: (zone as { id?: string }).id,
      });
      toast.success("Address saved");
      q.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save address");
    }
  };

  return (
    <div className="container-page grid gap-6 py-8 lg:grid-cols-2">
      <div>
        <h1 className="text-2xl font-bold">Addresses</h1>
        <div className="mt-4 space-y-3">
          {items.map((a) => (
            <div key={String(a.id)} className="card p-4">
              <p className="font-medium">{a.address}</p>
              <p className="text-sm text-muted">
                {a.contact_person_name} · {a.contact_person_number}
              </p>
              <button
                className="mt-2 text-sm text-danger"
                onClick={async () => {
                  if (!a.id) return;
                  await addressApi.remove([a.id]);
                  q.refetch();
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={add} className="card space-y-3 p-4">
        <h2 className="font-semibold">Add address</h2>
        <input className="input" placeholder="Contact name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="input" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <MapPicker lat={lat} lng={lng} onChange={(a, b) => { setLat(a); setLng(b); }} />
        <button className="btn-primary w-full">Save address</button>
      </form>
    </div>
  );
}
