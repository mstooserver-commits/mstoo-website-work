"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { catalogApi, providerApi } from "@/lib/api";
import { useLocationStore } from "@/lib/stores/location";
import { MapPicker } from "@/components/location/map-picker";
import type { Category, Paginated } from "@/types";

const RENT = ["rent/hour", "rent/day", "rent/week", "rent/month"];

export default function PostAdPage() {
  const loc = useLocationStore((s) => s.location);
  const [cats, setCats] = useState<Category[]>([]);
  const [subs, setSubs] = useState<Category[]>([]);
  const [catId, setCatId] = useState("");
  const [subId, setSubId] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [rent, setRent] = useState("rent/day");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState(loc?.address || "");
  const [lat, setLat] = useState(loc?.lat || 28.6139);
  const [lng, setLng] = useState(loc?.lng || 77.209);
  const [featured, setFeatured] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    catalogApi.categories().then((res) => setCats(((res as Paginated<Category>)?.data || []) as Category[]));
  }, []);

  useEffect(() => {
    if (!catId) return;
    catalogApi.children(catId).then((res) => setSubs(((res as Paginated<Category>)?.data || []) as Category[]));
  }, [catId]);

  const fileToBase64 = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        resolve(result.includes(",") ? result.split(",")[1] : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !subId || !name || !price) {
      toast.error("Add title, category, price and at least one photo");
      return;
    }
    setBusy(true);
    try {
      const cover = await fileToBase64(file);
      const form = new FormData();
      form.append("name", name);
      form.append("cover_image", cover);
      form.append("description", desc);
      form.append("sub_category_id", subId);
      form.append("price", price);
      form.append("rent_duration", rent);
      form.append("availability", "yes");
      form.append("is_featured", featured ? "yes" : "no");
      form.append("latitude", String(lat));
      form.append("longitude", String(lng));
      form.append("location", address);
      form.append("contact_info", contact);
      await providerApi.addService(form);
      toast.success("Ad posted");
      window.location.href = "/my-ads";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post ad");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">Post an ad</h1>
      <p className="mt-1 text-sm text-muted">Same fields as the MSTOO app. Images are sent as multipart like Flutter.</p>
      <form onSubmit={submit} className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={catId} onChange={(e) => setCatId(e.target.value)}>
                <option value="">Select</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Subcategory</label>
              <select className="input" value={subId} onChange={(e) => setSubId(e.target.value)}>
                <option value="">Select</option>
                {subs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Price (₹)</label>
              <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="label">Rent duration</label>
              <select className="input" value={rent} onChange={(e) => setRent(e.target.value)}>
                {RENT.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-28" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div>
            <label className="label">Contact</label>
            <input className="input" value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Request featured listing
          </label>
          <div>
            <label className="label">Photos</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Location</label>
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <MapPicker
            lat={lat}
            lng={lng}
            onChange={(a, b) => {
              setLat(a);
              setLng(b);
            }}
          />
          <button className="btn-post w-full" disabled={busy}>
            {busy ? "Publishing…" : "Publish ad"}
          </button>
        </div>
      </form>
    </div>
  );
}
