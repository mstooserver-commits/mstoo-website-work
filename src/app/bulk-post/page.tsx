"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, Plus, RefreshCw, Trash2, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";
import { providerApi } from "@/lib/api";
import {
  appendCategoryFields,
  asNamedList,
  asStringList,
  compressImage,
  emptyPostAdValues,
  fileToBase64,
  normalizeCatName,
} from "@/lib/post-ad";
import { useLocationStore } from "@/lib/stores/location";
import { useAuthStore } from "@/lib/stores/auth";

type Option = { id: string; name: string };
type Draft = {
  id: number;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategories: Option[];
  condition: string;
  clothSize: string;
  title: string;
  description: string;
  price: string;
  rentDuration: string;
  photos: File[];
  status: "pending" | "posting" | "success" | "failed";
  error?: string;
};
const createDraft = (id: number): Draft => ({
  id,
  categoryId: "",
  categoryName: "",
  subcategoryId: "",
  subcategories: [],
  condition: "good",
  clothSize: "M",
  title: "",
  description: "",
  price: "",
  rentDuration: "rent/day",
  photos: [],
  status: "pending",
});

export default function BulkPostPage() {
  const location = useLocationStore((state) => state.location);
  const user = useAuthStore((state) => state.user);
  const [categories, setCategories] = useState<Option[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([createDraft(1)]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void providerApi
      .postCategories()
      .then((data) => setCategories(asNamedList(data)))
      .catch(() => toast.error("Could not load categories"));
  }, []);
  const patch = (id: number, values: Partial<Draft>) =>
    setDrafts((items) => items.map((item) => (item.id === id ? { ...item, ...values } : item)));

  const categoryChanged = async (draft: Draft, categoryId: string) => {
    const selected = categories.find((item) => item.id === categoryId);
    patch(draft.id, {
      categoryId,
      categoryName: normalizeCatName(selected?.name),
      subcategoryId: "",
      subcategories: [],
      status: "pending",
      error: undefined,
    });
    try {
      const [subcategories, fields] = await Promise.allSettled([
        providerApi.postSubcategories(categoryId),
        providerApi.postFields(categoryId),
      ]);
      const fieldData = fields.status === "fulfilled" ? fields.value : {};
      const conditions = asStringList(fieldData.condition);
      const sizes = asStringList(fieldData.cloth_size);
      patch(draft.id, {
        subcategories: subcategories.status === "fulfilled" ? asNamedList(subcategories.value) : [],
        categoryName: normalizeCatName(String(fieldData.category_name || selected?.name || "")),
        condition: conditions[0] || "good",
        clothSize: sizes[0] || "M",
      });
    } catch {
      toast.error("Could not load subcategories");
    }
  };

  const submit = async (retryFailed = false) => {
    const candidates = drafts.filter((item) =>
      retryFailed ? item.status === "failed" : item.status !== "success",
    );
    const invalid = candidates.find(
      (item) =>
        !item.categoryId ||
        !item.subcategoryId ||
        !item.title.trim() ||
        !item.description.trim() ||
        !Number(item.price) ||
        !item.photos.length,
    );
    if (invalid) {
      toast.error("Complete every ad and add at least one photo");
      return;
    }
    if (!location) {
      toast.error("Select your location first");
      return;
    }
    setBusy(true);
    let posted = 0;
    let failed = 0;
    for (const draft of candidates) {
      patch(draft.id, { status: "posting", error: undefined });
      try {
        const photos = await Promise.all(
          draft.photos.slice(0, 6).map((file) => compressImage(file)),
        );
        const form = new FormData();
        form.append("name", draft.title.trim());
        form.append("description", draft.description.trim());
        form.append("sub_category_id", draft.subcategoryId);
        form.append("price", draft.price);
        form.append("rent_duration", draft.rentDuration);
        form.append("availability", "yes");
        form.append("is_featured", "no");
        form.append("location", location.address);
        form.append("latitude", String(location.lat));
        form.append("longitude", String(location.lng));
        const values = emptyPostAdValues({
          address: location.address,
          lat: location.lat,
          lng: location.lng,
          contact: user?.phone,
        });
        Object.assign(values, {
          catId: draft.categoryId,
          catName: draft.categoryName,
          subId: draft.subcategoryId,
          name: draft.title.trim(),
          desc: draft.description.trim(),
          price: draft.price,
          rent: draft.rentDuration,
          condition: draft.condition,
          delivery: ["pickup"],
          clothType: "general",
          clothSize: draft.clothSize,
          electronicType: "general",
          furnitureType: "general",
          equipmentType: "general",
          propertyType: "general",
          bedrooms: "1",
          bathrooms: "1",
          furnished: "unfurnished",
          serviceType: "general",
          modelYear: String(new Date().getFullYear()),
          fuelType: "petrol",
          transmission: "manual",
        });
        appendCategoryFields(form, values);
        if (draft.categoryName === "property" || draft.categoryName === "service") {
          form.append("condition", draft.condition);
        }
        if (draft.categoryName === "property") {
          form.append("delivery_pickup", JSON.stringify(["pickup"]));
        }
        form.append("cover_image", await fileToBase64(photos[0]));
        // cover_image contains photos[0]; send only additional gallery photos.
        photos.slice(1).forEach((photo) => form.append("images[]", photo, photo.name));
        await providerApi.addService(form);
        posted += 1;
        patch(draft.id, { status: "success", error: undefined });
      } catch (error) {
        failed += 1;
        patch(draft.id, {
          status: "failed",
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    }
    setBusy(false);
    if (!failed) toast.success(`All ${posted} ads posted successfully`);
    else if (posted) toast.error(`Posted ${posted} · Failed ${failed}. You can retry failed ads.`);
    else toast.error("Could not post ads. Check the errors and retry.");
  };

  return (
    <div className="container-page py-8 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Bulk add posts</h1>
          <p className="mt-1 text-sm text-muted">
            Create up to 10 ads and publish them one by one. Up to 6 photos per ad.
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary gap-2"
          disabled={busy || drafts.length >= 10}
          onClick={() =>
            setDrafts((items) =>
              items.length >= 10 ? items : [...items, createDraft(Date.now() + items.length)],
            )
          }
        >
          <Plus className="h-4 w-4" /> Add another
        </button>
      </div>
      <div className="mt-6 space-y-5">
        {drafts.map((draft, index) => (
          <section key={draft.id} className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-bold">Ad {index + 1}</h2>
                {draft.status === "posting" ? (
                  <LoaderCircle className="h-4 w-4 animate-spin text-brand" />
                ) : null}
                {draft.status === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : null}
                {draft.status === "failed" ? <XCircle className="h-4 w-4 text-danger" /> : null}
              </div>
              {drafts.length > 1 ? (
                <button
                  type="button"
                  className="text-danger"
                  disabled={busy}
                  onClick={() => setDrafts((items) => items.filter((item) => item.id !== draft.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="input"
                value={draft.categoryId}
                disabled={busy || draft.status === "success"}
                onChange={(event) => void categoryChanged(draft, event.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <select
                className="input"
                value={draft.subcategoryId}
                onChange={(event) =>
                  patch(draft.id, { subcategoryId: event.target.value, status: "pending" })
                }
                disabled={!draft.categoryId || busy || draft.status === "success"}
              >
                <option value="">Select subcategory</option>
                {draft.subcategories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <input
                className="input"
                placeholder="Ad title"
                value={draft.title}
                disabled={busy || draft.status === "success"}
                onChange={(event) =>
                  patch(draft.id, { title: event.target.value, status: "pending" })
                }
              />
              <input
                className="input"
                inputMode="decimal"
                placeholder="Price ₹"
                value={draft.price}
                disabled={busy || draft.status === "success"}
                onChange={(event) =>
                  patch(draft.id, { price: event.target.value, status: "pending" })
                }
              />
              <select
                className="input"
                value={draft.rentDuration}
                disabled={busy || draft.status === "success"}
                onChange={(event) =>
                  patch(draft.id, { rentDuration: event.target.value, status: "pending" })
                }
              >
                <option value="rent/hour">Per hour</option>
                <option value="rent/day">Per day</option>
                <option value="rent/week">Per week</option>
                <option value="rent/month">Per month</option>
                <option value="sale">Sale</option>
              </select>
              <input
                className="input"
                type="file"
                accept="image/*"
                multiple
                disabled={busy || draft.status === "success"}
                onChange={(event) =>
                  patch(draft.id, {
                    photos: Array.from(event.target.files || []).slice(0, 6),
                    status: "pending",
                  })
                }
              />
              <textarea
                className="input min-h-28 sm:col-span-2"
                placeholder="Description"
                value={draft.description}
                disabled={busy || draft.status === "success"}
                onChange={(event) =>
                  patch(draft.id, { description: event.target.value, status: "pending" })
                }
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              {draft.photos.length} photo{draft.photos.length === 1 ? "" : "s"} selected
            </p>
            {draft.error ? <p className="mt-2 text-sm text-danger">{draft.error}</p> : null}
          </section>
        ))}
      </div>
      <button
        type="button"
        className="btn-primary mt-6 w-full gap-2 sm:w-auto"
        disabled={busy}
        onClick={() => void submit(false)}
      >
        <Upload className="h-4 w-4" />{" "}
        {busy ? "Publishing…" : `Publish ${drafts.length} ad${drafts.length === 1 ? "" : "s"}`}
      </button>
      {drafts.some((draft) => draft.status === "failed") ? (
        <button
          type="button"
          className="btn-secondary mt-6 gap-2 sm:ml-3"
          disabled={busy}
          onClick={() => void submit(true)}
        >
          <RefreshCw className="h-4 w-4" /> Retry failed ads
        </button>
      ) : null}
    </div>
  );
}
