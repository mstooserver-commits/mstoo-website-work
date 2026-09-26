"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  Camera,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Hammer,
  House,
  ImagePlus,
  IndianRupee,
  MapPin,
  Navigation,
  Shirt,
  Smartphone,
  Sofa,
  Star,
  Tag,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { catalogApi, locationApi, providerApi } from "@/lib/api";
import { formatInr } from "@/lib/currency";
import { useAuthStore } from "@/lib/stores/auth";
import { extractPlaceLatLng, useLocationStore } from "@/lib/stores/location";
import { useConfigStore } from "@/lib/stores/config";
import { MapPicker } from "@/components/location/map-picker";
import { cn } from "@/lib/utils";
import type { Category, Paginated, PlacePrediction } from "@/types";
import {
  DELIVERY_OPTIONS,
  FALLBACK_CLOTH_SIZES,
  FALLBACK_CONDITION,
  FALLBACK_FUEL,
  FALLBACK_FURNISHED,
  FALLBACK_TRANSMISSION,
  PET_OPTIONS,
  POST_STEPS,
  RENT_OPTIONS,
  UTILITY_OPTIONS,
  appendCategoryFields,
  asNamedList,
  asStringList,
  compressImage,
  emptyPostAdValues,
  fileToBase64,
  normalizeCatName,
  type CatKey,
  type PostAdValues,
} from "@/lib/post-ad";

const CAT_ICON: Record<string, typeof Car> = {
  vehicle: Car,
  electronic: Smartphone,
  furniture: Sofa,
  equipment: Hammer,
  property: House,
  cloth: Shirt,
  service: Briefcase,
};

function unwrapPredictions(payload: unknown): PlacePrediction[] {
  if (Array.isArray(payload)) return payload as PlacePrediction[];
  const body = payload as { predictions?: PlacePrediction[]; content?: { predictions?: PlacePrediction[] } };
  return body?.predictions || body?.content?.predictions || [];
}

function geocodeAddress(payload: unknown) {
  const body = payload as {
    results?: { formatted_address?: string }[];
    content?: { results?: { formatted_address?: string }[]; formatted_address?: string };
    formatted_address?: string;
  };
  return (
    body?.results?.[0]?.formatted_address ||
    body?.content?.results?.[0]?.formatted_address ||
    body?.content?.formatted_address ||
    body?.formatted_address ||
    ""
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">
        {label}
        {required ? <span className="text-brand"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function Chips({
  options,
  value,
  onChange,
  multiple,
}: {
  options: string[];
  value: string | string[];
  onChange: (next: string | string[]) => void;
  multiple?: boolean;
}) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => {
              if (multiple) {
                const next = on ? selected.filter((item) => item !== option) : [...selected, option];
                onChange(next);
              } else {
                onChange(on ? "" : option);
              }
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm capitalize transition",
              on ? "border-brand bg-brand-soft font-semibold text-brand" : "border-line bg-white text-ink hover:border-brand/40",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function CategoryDetails({
  cat,
  values,
  set,
  lists,
}: {
  cat: CatKey;
  values: PostAdValues;
  set: (patch: Partial<PostAdValues>) => void;
  lists: {
    fuel: string[];
    transmission: string[];
    clothSize: string[];
    furnished: string[];
  };
}) {
  if (!cat) {
    return <p className="text-sm text-muted">Choose a category first. You can skip extra specs if none apply.</p>;
  }
  if (cat === "vehicle") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Brand / make" required>
          <input className="input" placeholder="Tata, Honda" value={values.vehicleBrand} onChange={(e) => set({ vehicleBrand: e.target.value })} />
        </Field>
        <Field label="Model year" required>
          <input className="input" inputMode="numeric" placeholder="2022" value={values.modelYear} onChange={(e) => set({ modelYear: e.target.value })} />
        </Field>
        <Field label="Mileage" required>
          <input className="input" placeholder="25000 km" value={values.mileage} onChange={(e) => set({ mileage: e.target.value })} />
        </Field>
        <Field label="Fuel type">
          <Chips options={lists.fuel} value={values.fuelType} onChange={(v) => set({ fuelType: String(v) })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Transmission">
            <Chips options={lists.transmission} value={values.transmission} onChange={(v) => set({ transmission: String(v) })} />
          </Field>
        </div>
      </div>
    );
  }
  if (cat === "electronic") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product type" required>
          <input className="input" placeholder="Laptop, mobile, camera" value={values.electronicType} onChange={(e) => set({ electronicType: e.target.value })} />
        </Field>
        <Field label="Brand" required>
          <input className="input" placeholder="Apple, Sony" value={values.electronicBrand} onChange={(e) => set({ electronicBrand: e.target.value })} />
        </Field>
        <Field label="Model year">
          <input className="input" placeholder="2024" value={values.modelYear} onChange={(e) => set({ modelYear: e.target.value })} />
        </Field>
        <Field label="Screen size">
          <input className="input" placeholder="6.1 inch" value={values.screenSize} onChange={(e) => set({ screenSize: e.target.value })} />
        </Field>
        <Field label="Storage">
          <input className="input" placeholder="256 GB" value={values.storage} onChange={(e) => set({ storage: e.target.value })} />
        </Field>
        <Field label="Operating system">
          <input className="input" placeholder="iOS, Android, Windows" value={values.operatingSystem} onChange={(e) => set({ operatingSystem: e.target.value })} />
        </Field>
        <Field label="Camera">
          <input className="input" placeholder="48 MP" value={values.camera} onChange={(e) => set({ camera: e.target.value })} />
        </Field>
        <Field label="Connectivity">
          <input className="input" placeholder="Wi-Fi, Bluetooth, 5G" value={values.connectivity} onChange={(e) => set({ connectivity: e.target.value })} />
        </Field>
      </div>
    );
  }
  if (cat === "equipment") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Equipment type" required>
          <input className="input" placeholder="Fitness, construction" value={values.equipmentType} onChange={(e) => set({ equipmentType: e.target.value })} />
        </Field>
        <Field label="Brand" required>
          <input className="input" placeholder="Hitachi, Bosch" value={values.equipmentBrand} onChange={(e) => set({ equipmentBrand: e.target.value })} />
        </Field>
        <Field label="Power source">
          <input className="input" placeholder="Electric, diesel" value={values.powerSource} onChange={(e) => set({ powerSource: e.target.value })} />
        </Field>
        <Field label="Weight">
          <input className="input" placeholder="12 kg" value={values.weight} onChange={(e) => set({ weight: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Dimensions">
            <input className="input" placeholder="L x W x H" value={values.dimensions} onChange={(e) => set({ dimensions: e.target.value })} />
          </Field>
        </div>
      </div>
    );
  }
  if (cat === "furniture") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Furniture type" required>
          <input className="input" placeholder="Sofa, chair, table" value={values.furnitureType} onChange={(e) => set({ furnitureType: e.target.value })} />
        </Field>
        <Field label="Brand" required>
          <input className="input" placeholder="Wooden Street, Hometown" value={values.furnitureBrand} onChange={(e) => set({ furnitureBrand: e.target.value })} />
        </Field>
      </div>
    );
  }
  if (cat === "property") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Property type" required>
          <input className="input" placeholder="Apartment, house" value={values.propertyType} onChange={(e) => set({ propertyType: e.target.value })} />
        </Field>
        <Field label="Square footage" required>
          <input className="input" placeholder="1200 sq ft" value={values.squareFootage} onChange={(e) => set({ squareFootage: e.target.value })} />
        </Field>
        <Field label="Bedrooms" required>
          <input className="input" inputMode="numeric" placeholder="2" value={values.bedrooms} onChange={(e) => set({ bedrooms: e.target.value })} />
        </Field>
        <Field label="Bathrooms" required>
          <input className="input" inputMode="numeric" placeholder="2" value={values.bathrooms} onChange={(e) => set({ bathrooms: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Furnishing">
            <Chips options={lists.furnished} value={values.furnished} onChange={(v) => set({ furnished: String(v) })} />
          </Field>
        </div>
      </div>
    );
  }
  if (cat === "cloth") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Item type" required>
          <input className="input" placeholder="Saree, lehenga, sherwani" value={values.clothType} onChange={(e) => set({ clothType: e.target.value })} />
        </Field>
        <Field label="Brand">
          <input className="input" placeholder="Zara, H&M" value={values.clothBrand} onChange={(e) => set({ clothBrand: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Size" required>
            <Chips options={lists.clothSize} value={values.clothSize} onChange={(v) => set({ clothSize: String(v) })} />
          </Field>
        </div>
      </div>
    );
  }
  if (cat === "service") {
    return (
      <Field label="Service type" required>
        <input className="input" placeholder="Home service, professional service" value={values.serviceType} onChange={(e) => set({ serviceType: e.target.value })} />
      </Field>
    );
  }
  return <p className="text-sm text-muted">No extra specs for this category. Continue to price and photos.</p>;
}

export function PostAdForm() {
  const router = useRouter();
  const loc = useLocationStore((s) => s.location);
  const user = useAuthStore((s) => s.user);
  const config = useConfigStore((s) => s.config);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<PostAdValues>(() =>
    emptyPostAdValues({
      address: loc?.address,
      lat: loc?.lat,
      lng: loc?.lng,
      contact: user?.phone,
    }),
  );
  const [cats, setCats] = useState<Array<{ id: string; name: string }>>([]);
  const [subs, setSubs] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingFields, setLoadingFields] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [placeQuery, setPlaceQuery] = useState("");
  const [places, setPlaces] = useState<PlacePrediction[]>([]);
  const [busy, setBusy] = useState(false);
  const [featuredPrice, setFeaturedPrice] = useState(50);
  const [featuredDays, setFeaturedDays] = useState("30 days");
  const [lists, setLists] = useState({
    fuel: FALLBACK_FUEL,
    transmission: FALLBACK_TRANSMISSION,
    clothSize: FALLBACK_CLOTH_SIZES,
    furnished: FALLBACK_FURNISHED,
    condition: FALLBACK_CONDITION,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<PostAdValues>) => setValues((cur) => ({ ...cur, ...patch }));

  useEffect(() => {
    if (loc?.address && !values.address) {
      set({ address: loc.address, lat: loc.lat, lng: loc.lng });
    }
    if (user?.phone && !values.contact) set({ contact: user.phone });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc?.address, user?.phone]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const fromPost = asNamedList(await providerApi.postCategories());
        if (!ignore && fromPost.length) {
          setCats(fromPost);
          return;
        }
      } catch {
        /* fallback below */
      }
      try {
        const res = await catalogApi.categories();
        const list = ((res as Paginated<Category>)?.data || []) as Category[];
        if (!ignore) setCats(list.map((c) => ({ id: String(c.id), name: c.name })));
      } catch {
        toast.error("Could not load categories");
      } finally {
        if (!ignore) setLoadingCats(false);
      }
    })().finally(() => {
      if (!ignore) setLoadingCats(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!values.catId) return;
    let ignore = false;
    setLoadingFields(true);
    setSubs([]);
    set({ subId: "" });
    (async () => {
      try {
        const [subRes, fieldRes] = await Promise.allSettled([
          providerApi.postSubcategories(values.catId),
          providerApi.postFields(values.catId),
        ]);
        if (ignore) return;
        if (subRes.status === "fulfilled") {
          const listed = asNamedList(subRes.value);
          if (listed.length) {
            setSubs(listed);
          } else {
            try {
              const children = await catalogApi.children(values.catId);
              if (!ignore) {
                const list = ((children as Paginated<Category>)?.data || []) as Category[];
                setSubs(list.map((c) => ({ id: String(c.id), name: c.name })));
              }
            } catch {
              /* ignore */
            }
          }
        } else {
          try {
            const children = await catalogApi.children(values.catId);
            if (!ignore) {
              const list = ((children as Paginated<Category>)?.data || []) as Category[];
              setSubs(list.map((c) => ({ id: String(c.id), name: c.name })));
            }
          } catch {
            /* ignore */
          }
        }
        const selected = cats.find((c) => c.id === values.catId);
        let catName = normalizeCatName(selected?.name);
        if (fieldRes.status === "fulfilled") {
          const data = fieldRes.value;
          catName = normalizeCatName(String(data.category_name || selected?.name || ""));
          const price = Number(data.featured_price ?? 50);
          setFeaturedPrice(Number.isFinite(price) ? price : 50);
          setFeaturedDays(String(data.featured_days || "30 days"));
          setLists({
            fuel: asStringList(data.fuel_type).length ? asStringList(data.fuel_type) : FALLBACK_FUEL,
            transmission: asStringList(data.transmission).length ? asStringList(data.transmission) : FALLBACK_TRANSMISSION,
            clothSize: asStringList(data.cloth_size).length ? asStringList(data.cloth_size) : FALLBACK_CLOTH_SIZES,
            furnished: asStringList(data.furnished).length ? asStringList(data.furnished) : FALLBACK_FURNISHED,
            condition: asStringList(data.condition).length ? asStringList(data.condition) : FALLBACK_CONDITION,
          });
        }
        set({ catName });
      } finally {
        if (!ignore) setLoadingFields(false);
      }
    })();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.catId]);

  useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [photos]);

  useEffect(() => {
    if (!placeQuery.trim()) {
      setPlaces([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const data = await locationApi.autocomplete(placeQuery.trim());
        setPlaces(unwrapPredictions(data));
      } catch {
        setPlaces([]);
      }
    }, 280);
    return () => clearTimeout(handle);
  }, [placeQuery]);

  const rentLabel = RENT_OPTIONS.find((r) => r.value === values.rent)?.label || values.rent;
  const selectedCat = cats.find((c) => c.id === values.catId);

  const pickFiles = async (list: FileList | File[]) => {
    const incoming = Array.from(list).filter((file) => file.type.startsWith("image/"));
    if (!incoming.length) return;
    const next = [...photos];
    for (const file of incoming) {
      if (next.length >= 8) break;
      next.push(await compressImage(file));
    }
    setPhotos(next);
  };

  const validateStep = (index: number) => {
    if (index === 0) {
      if (!values.catId) return "Select a category";
      if (loadingFields) return "Loading category fields…";
      if (!values.subId) return "Select a sub category";
      if (!values.name.trim()) return "Enter an ad title";
    }
    if (index === 2) {
      if (!values.rent) return "Select rent duration";
      if (!values.price.trim()) return "Enter a rental price";
    }
    if (index === 3) {
      if (!values.desc.trim()) return "Add a description";
      if (!photos.length) return "Upload at least one photo";
      if (!values.address.trim()) return "Add a location";
      if (!values.contact.trim()) return "Add a contact number";
    }
    return "";
  };

  const next = () => {
    const error = validateStep(step);
    if (error) {
      toast.error(error);
      return;
    }
    setStep((s) => Math.min(POST_STEPS.length - 1, s + 1));
  };

  const buildForm = async (payment?: { order_id?: string; payment_id?: string }) => {
    const cover = await fileToBase64(photos[0]);
    const form = new FormData();
    form.append("name", values.name.trim());
    form.append("cover_image", cover);
    form.append("description", values.desc.trim());
    form.append("sub_category_id", values.subId);
    form.append("price", values.price);
    form.append("rent_duration", values.rent);
    form.append("availability", "yes");
    form.append("is_featured", values.featured ? "yes" : "no");
    form.append("latitude", String(values.lat));
    form.append("longitude", String(values.lng));
    if (payment?.order_id) form.append("order_id", payment.order_id);
    if (payment?.payment_id) form.append("payment_id", payment.payment_id);
    appendCategoryFields(form, values);
    photos.forEach((file) => form.append("images[]", file, file.name));
    return form;
  };

  const publish = async (payment?: { order_id?: string; payment_id?: string }) => {
    setBusy(true);
    try {
      await providerApi.addService(await buildForm(payment));
      toast.success("Ad posted");
      router.push("/my-ads");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post ad");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    const error = POST_STEPS.map((_, i) => validateStep(i)).find(Boolean);
    if (error) {
      toast.error(error);
      return;
    }
    if (!values.featured || featuredPrice <= 0) {
      await publish();
      return;
    }
    const key =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      config?.razorpay_key ||
      config?.razorpayKey;
    if (!key || !window.Razorpay) {
      toast.error("Razorpay is not configured for featured ads");
      return;
    }
    const amount = Math.max(100, Math.round(featuredPrice * 100));
    let orderId: string | undefined;
    try {
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "INR" }),
      });
      if (orderRes.ok) {
        const order = await orderRes.json();
        orderId = order.id;
      }
    } catch {
      /* key-only checkout */
    }
    const rzp = new window.Razorpay({
      key,
      amount,
      currency: "INR",
      name: "MSTOO",
      description: `Featured ad for ${featuredDays}`,
      order_id: orderId,
      handler: async (response: { razorpay_payment_id?: string; razorpay_order_id?: string }) => {
        await publish({
          payment_id: response.razorpay_payment_id,
          order_id: response.razorpay_order_id || orderId,
        });
      },
    }) as { open: () => void; on?: (event: string, handler: (response: unknown) => void) => void };
    rzp.on?.("payment.failed", () => toast.error("Featured payment failed"));
    rzp.open();
  };

  const selectPlace = async (place: PlacePrediction) => {
    if (!place.place_id) return;
    try {
      const details = await locationApi.placeDetails(place.place_id);
      const parsed = extractPlaceLatLng(details);
      if (!parsed) throw new Error("Could not resolve that place");
      set({
        address: parsed.address || place.description || values.address,
        lat: parsed.lat,
        lng: parsed.lng,
      });
      setPlaceQuery("");
      setPlaces([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not set location");
    }
  };

  const useCurrent = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const geo = await locationApi.geocode(lat, lng);
          set({ lat, lng, address: geocodeAddress(geo) || `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        } catch {
          set({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        }
      },
      () => toast.error("Location permission denied"),
    );
  };

  const previewPrice = values.price ? `${formatInr(Number(values.price) || 0)} ${rentLabel.toLowerCase()}` : "Set a price";

  return (
    <div className="bg-page pb-28 md:pb-10">
      <section className="bg-[linear-gradient(135deg,#D93F46_0%,#AC2A29_55%,#7a1e1e_100%)] text-white">
        <div className="container-page py-8 md:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">List on MSTOO</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Post an ad</h1>
          <p className="mt-2 max-w-xl text-sm text-white/85">
            Same listing fields as the MSTOO app. Clear photos and accurate details help renters book faster.
          </p>
        </div>
      </section>

      <div className="container-page -mt-5">
        <div className="card overflow-hidden p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between text-xs font-semibold text-muted">
            <span className="text-brand">
              Step {step + 1} of {POST_STEPS.length}
            </span>
            <span>{POST_STEPS[step].title}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${((step + 1) / POST_STEPS.length) * 100}%` }} />
          </div>
          <div className="mt-3 hidden gap-2 md:grid md:grid-cols-5">
            {POST_STEPS.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  if (index < step) setStep(index);
                }}
                className={cn(
                  "rounded-md px-2 py-2 text-left text-xs",
                  index === step ? "bg-brand-soft text-brand" : index < step ? "bg-page text-ink" : "text-muted",
                )}
              >
                <span className="block font-semibold">
                  {index + 1}. {item.title}
                </span>
                <span className="text-[11px] opacity-80">{item.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (step < POST_STEPS.length - 1) next();
              else void submit();
            }}
          >
            {step === 0 ? (
              <div className="card space-y-5 p-5">
                <Field label="Category" required hint="Fields marked * are required.">
                  {loadingCats ? <p className="text-sm text-muted">Loading categories…</p> : null}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {cats.map((cat) => {
                      const key = normalizeCatName(cat.name);
                      const Icon = CAT_ICON[key] || Tag;
                      const on = values.catId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => set({ catId: cat.id, catName: key, subId: "" })}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-3 py-3 text-left text-sm font-medium transition",
                            on ? "border-brand bg-brand-soft text-brand" : "border-line bg-white hover:border-brand/40",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="line-clamp-2">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <Field label="Sub category" required>
                  {loadingFields ? <p className="text-sm text-muted">Loading sub categories…</p> : null}
                  <div className="flex flex-wrap gap-2">
                    {subs.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => set({ subId: sub.id })}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm",
                          values.subId === sub.id ? "border-brand bg-brand-soft font-semibold text-brand" : "border-line hover:border-brand/40",
                        )}
                      >
                        {sub.name}
                      </button>
                    ))}
                    {!loadingFields && values.catId && subs.length === 0 ? (
                      <p className="text-sm text-muted">No sub categories found for this category.</p>
                    ) : null}
                  </div>
                </Field>
                <Field label="Ad title" required>
                  <input
                    className="input"
                    placeholder="e.g. Canon DSLR camera for rent"
                    value={values.name}
                    onChange={(e) => set({ name: e.target.value })}
                  />
                </Field>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="card space-y-4 p-5">
                <div>
                  <h2 className="text-lg font-bold">Item details</h2>
                  <p className="mt-1 text-sm text-muted">Add specs for {selectedCat?.name || "this category"}. Skip anything that does not apply.</p>
                </div>
                <CategoryDetails cat={values.catName} values={values} set={set} lists={lists} />
              </div>
            ) : null}

            {step === 2 ? (
              <div className="card space-y-5 p-5">
                <Field label="Rental price" required>
                  <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                    <select className="input" value={values.rent} onChange={(e) => set({ rent: e.target.value })}>
                      {RENT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="relative">
                      <IndianRupee className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
                      <input
                        className="input pl-9"
                        inputMode="numeric"
                        placeholder="e.g. 1500"
                        value={values.price}
                        onChange={(e) => set({ price: e.target.value.replace(/[^\d]/g, "") })}
                      />
                    </div>
                  </div>
                </Field>
                <Field label="Condition">
                  <Chips options={lists.condition} value={values.condition} onChange={(v) => set({ condition: String(v) })} />
                </Field>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <div className="card space-y-4 p-5">
                  <Field label="Description" required hint="Describe condition, what is included, and rental terms.">
                    <textarea
                      className="input min-h-36"
                      placeholder="Describe condition, what is included, and rental terms…"
                      value={values.desc}
                      onChange={(e) => set({ desc: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="card space-y-3 p-5">
                  <Field label="Product photos" required hint="Add up to 8 clear photos. The first photo is the cover.">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) void pickFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        void pickFiles(e.dataTransfer.files);
                      }}
                      className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-brand/40 bg-brand-soft/40 px-4 py-8 text-sm text-brand hover:bg-brand-soft"
                    >
                      <ImagePlus className="mb-2 h-7 w-7" />
                      Drag photos here or click to browse
                    </button>
                    {previews.length ? (
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {previews.map((src, index) => (
                          <div key={src} className="relative overflow-hidden rounded-md">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" className="h-24 w-full object-cover" />
                            {index === 0 ? (
                              <span className="absolute left-1 top-1 rounded bg-navy/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                Cover
                              </span>
                            ) : null}
                            <button
                              type="button"
                              className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                              onClick={() => setPhotos((cur) => cur.filter((_, i) => i !== index))}
                              aria-label="Remove photo"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </Field>
                </div>
                <div className="card space-y-3 p-5">
                  <Field label="Location" required>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
                      <input
                        className="input pl-9"
                        placeholder="Search area, city or landmark"
                        value={placeQuery || values.address}
                        onChange={(e) => {
                          setPlaceQuery(e.target.value);
                          set({ address: e.target.value });
                        }}
                      />
                    </div>
                    <button type="button" className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-brand" onClick={useCurrent}>
                      <Navigation className="h-4 w-4" />
                      Use current location
                    </button>
                    {places.length ? (
                      <ul className="mt-2 divide-y divide-line rounded-md border border-line bg-white">
                        {places.map((place) => (
                          <li key={place.place_id}>
                            <button type="button" className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-page" onClick={() => void selectPlace(place)}>
                              <MapPin className="mt-0.5 h-4 w-4 text-brand" />
                              {place.description}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </Field>
                  <MapPicker
                    lat={values.lat}
                    lng={values.lng}
                    onChange={async (lat, lng) => {
                      set({ lat, lng });
                      try {
                        const geo = await locationApi.geocode(lat, lng);
                        const address = geocodeAddress(geo);
                        if (address) set({ address, lat, lng });
                      } catch {
                        /* keep coords */
                      }
                    }}
                  />
                </div>
                <div className="card grid gap-4 p-5 sm:grid-cols-2">
                  <Field label="Availability date" required>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
                      <input className="input pl-9" type="date" value={values.availabilityDate} onChange={(e) => set({ availabilityDate: e.target.value })} />
                    </div>
                  </Field>
                  <Field label="Contact number" required>
                    <div className="relative">
                      <input className="input pl-9" inputMode="tel" placeholder="9876543210" value={values.contact} onChange={(e) => set({ contact: e.target.value })} />
                    </div>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Deposit and security">
                      <textarea className="input min-h-20" placeholder="e.g. ₹2000 refundable deposit, ID required" value={values.deposits} onChange={(e) => set({ deposits: e.target.value })} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Documents required">
                      <textarea className="input min-h-20" placeholder="e.g. Aadhaar, driving licence" value={values.documents} onChange={(e) => set({ documents: e.target.value })} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Additional information">
                      <textarea className="input min-h-20" placeholder="Any extra details for renters" value={values.additional} onChange={(e) => set({ additional: e.target.value })} />
                    </Field>
                  </div>
                  {values.catName === "property" ? (
                    <>
                      <div className="sm:col-span-2">
                        <Field label="Utilities included">
                          <Chips multiple options={UTILITY_OPTIONS} value={values.utilities} onChange={(v) => set({ utilities: v as string[] })} />
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Pets">
                          <Chips multiple options={PET_OPTIONS} value={values.pets} onChange={(v) => set({ pets: v as string[] })} />
                        </Field>
                      </div>
                    </>
                  ) : (
                    <div className="sm:col-span-2">
                      <Field label="Delivery / pickup">
                        <Chips multiple options={DELIVERY_OPTIONS} value={values.delivery} onChange={(v) => set({ delivery: v as string[] })} />
                      </Field>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <Field label="Safety guidelines">
                      <textarea className="input min-h-20" placeholder="e.g. Return with full tank, no smoking" value={values.safety} onChange={(e) => set({ safety: e.target.value })} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Your rental terms">
                      <textarea className="input min-h-20" placeholder="e.g. Late return fee, cancellation policy" value={values.terms} onChange={(e) => set({ terms: e.target.value })} />
                    </Field>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="card space-y-4 p-5">
                <div className="flex items-start justify-between gap-4 rounded-lg border border-post/40 bg-[#FFF8E8] p-4">
                  <div>
                    <p className="flex items-center gap-2 font-semibold">
                      <Star className="h-4 w-4 text-post-dark" />
                      Featured ad
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Highlight your listing in search and category pages for {featuredDays}.
                    </p>
                    {values.featured ? (
                      <p className="mt-2 text-sm font-semibold text-navy">Charges: {formatInr(featuredPrice)}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={values.featured}
                    onClick={() => set({ featured: !values.featured })}
                    className={cn("relative h-7 w-12 rounded-full transition", values.featured ? "bg-post" : "bg-line")}
                  >
                    <span className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition", values.featured ? "left-5" : "left-0.5")} />
                  </button>
                </div>
                <ul className="space-y-2 text-sm text-ink/90">
                  <li className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-success" />
                    Title: {values.name || "Untitled"}
                  </li>
                  <li className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-success" />
                    {photos.length} photo{photos.length === 1 ? "" : "s"} · {previewPrice}
                  </li>
                  <li className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-success" />
                    {values.address || "No location yet"}
                  </li>
                </ul>
              </div>
            ) : null}

            <div className="flex gap-3">
              {step > 0 ? (
                <button type="button" className="btn-secondary flex-1 gap-1" onClick={() => setStep((s) => s - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              ) : null}
              <button type="submit" className="btn-post flex-1 gap-1" disabled={busy}>
                {step < POST_STEPS.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : busy ? (
                  "Publishing…"
                ) : values.featured ? (
                  `Pay ${formatInr(featuredPrice)} & publish`
                ) : (
                  "Publish ad"
                )}
              </button>
            </div>
          </form>

          <aside className="hidden lg:block">
            <div className="sticky top-24 card overflow-hidden">
              <div className="relative h-40 bg-brand-soft">
                {previews[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previews[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-brand">
                    <Camera className="h-8 w-8" />
                    <p className="mt-2 text-xs">Cover photo preview</p>
                  </div>
                )}
                {values.featured ? (
                  <span className="absolute left-3 top-3 rounded-full bg-post px-2 py-0.5 text-[11px] font-bold text-navy">Featured</span>
                ) : null}
              </div>
              <div className="space-y-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{selectedCat?.name || "Category"}</p>
                <h2 className="text-lg font-bold leading-snug">{values.name || "Your ad title"}</h2>
                <p className="text-brand font-semibold">{previewPrice}</p>
                <p className="flex items-start gap-1 text-xs text-muted">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {values.address || "Location will appear here"}
                </p>
                <p className="line-clamp-4 text-sm text-ink/80">{values.desc || "Write a description so renters know what they are booking."}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
