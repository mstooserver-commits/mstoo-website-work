"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Grid2X2, MapPin, Search } from "lucide-react";
import { catalogApi } from "@/lib/api";
import { categoryImage } from "@/lib/media";
import { useConfigStore } from "@/lib/stores/config";
import { useLocationStore } from "@/lib/stores/location";
import { SafeImage } from "@/components/ui/safe-image";
import type { Category, Paginated } from "@/types";

function categoryList(payload?: Paginated<Category>) {
  return payload?.data ?? [];
}

export function HomeHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const location = useLocationStore((state) => state.location);
  const setPickerOpen = useLocationStore((state) => state.setPickerOpen);
  const imageBase = useConfigStore((state) => state.config?.image_base_url);
  const categories = useQuery({
    queryKey: ["categories", location?.zoneId],
    enabled: Boolean(location?.zoneId),
    queryFn: () => catalogApi.categories(),
  });

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    if (categoryId) params.set("category", categoryId);
    const searchParams = params.toString();
    router.push(searchParams ? `/search?${searchParams}` : "/search");
  };

  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-50 via-white to-emerald-50 px-5 py-12 text-center shadow-soft sm:px-10 sm:py-16">
      <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full border border-emerald-200/70 sm:h-64 sm:w-64" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full border border-rose-200/70 sm:h-72 sm:w-72" />
      <div className="relative mx-auto max-w-5xl">
        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
          Find it. Rent it. Hire nearby.
        </span>
        <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
          Discover rentals and services <span className="text-brand">near you</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
          Explore local listings, compare details, and book with confidence on MSTOO.
        </p>
        <form
          onSubmit={search}
          className="mx-auto mt-8 grid max-w-4xl gap-2 rounded-2xl border border-rose-100 bg-white p-2 text-left shadow-card md:grid-cols-[minmax(0,1.35fr)_minmax(150px,.8fr)_minmax(170px,.9fr)_auto]"
        >
          <label className="flex min-w-0 flex-1 items-center gap-2 px-3">
            <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            <span className="sr-only">Search rentals, products, and services</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What are you looking for?"
              className="min-w-0 flex-1 border-0 py-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-0"
            />
          </label>
          <label className="flex min-w-0 items-center gap-2 rounded-xl border border-line px-3">
            <Grid2X2 className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            <span className="sr-only">Category</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-muted outline-none"
              disabled={!location?.zoneId || categories.isLoading}
            >
              <option value="">All categories</option>
              {categoryList(categories.data).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex min-w-0 items-center gap-2 rounded-xl border border-line px-3 py-3 text-left text-sm text-muted hover:bg-page"
          >
            <MapPin className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            <span className="truncate">{location?.address || "Choose your location"}</span>
          </button>
          <button type="submit" className="btn-primary gap-2 rounded-xl px-6">
            <Search className="h-4 w-4" aria-hidden="true" />
            Search
          </button>
        </form>

        {categoryList(categories.data).length > 0 ? (
          <div className="mt-8">
            <div className="mb-4 flex items-end justify-between text-left">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                  Explore MSTOO
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-ink">Browse categories</h2>
              </div>
              <Link href="/categories" className="text-sm font-semibold text-brand">
                View all <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
              {categoryList(categories.data)
                .slice(0, 6)
                .map((category, index) => {
                  const tones = [
                    "bg-amber-100/80",
                    "bg-blue-100/80",
                    "bg-emerald-100/80",
                    "bg-orange-100/80",
                    "bg-pink-100/80",
                    "bg-green-100/80",
                  ];
                  return (
                    <Link
                      key={category.id}
                      href={`/category/${category.id}`}
                      className={`group flex min-w-[138px] flex-col items-center rounded-2xl p-4 text-center transition hover:-translate-y-0.5 hover:shadow-card ${tones[index % tones.length]}`}
                    >
                      <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-soft">
                        <SafeImage
                          src={categoryImage(category, imageBase)}
                          alt={category.name}
                          className="h-11 w-11 object-contain"
                        />
                      </span>
                      <span className="mt-3 line-clamp-2 text-sm font-bold text-ink group-hover:text-brand">
                        {category.name}
                      </span>
                    </Link>
                  );
                })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
