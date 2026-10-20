"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { mediaFallbacks } from "@/lib/media";
import { useLocationStore } from "@/lib/stores/location";
import { useConfigStore } from "@/lib/stores/config";
import { BannerCarousel } from "@/components/catalog/banner-carousel";
import { ServiceGrid } from "@/components/service/service-card";
import { ServiceCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { SafeImage } from "@/components/ui/safe-image";
import type { Banner, Campaign, Category, Paginated, Service } from "@/types";

function list<T>(payload: Paginated<T> | T[] | undefined): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.data ?? [];
}

export function HomeFeed() {
  const location = useLocationStore((s) => s.location);
  const imageBase = useConfigStore((s) => s.config?.image_base_url);
  const zoneId = location?.zoneId;
  const lat = location?.lat;
  const lng = location?.lng;

  const banners = useQuery({
    queryKey: ["banners", zoneId],
    enabled: Boolean(zoneId),
    queryFn: () => catalogApi.banners(),
  });
  const campaigns = useQuery({
    queryKey: ["campaigns", zoneId],
    enabled: Boolean(zoneId),
    queryFn: () => catalogApi.campaigns(),
  });
  const featured = useQuery({
    queryKey: ["featured-ads", zoneId],
    enabled: Boolean(zoneId),
    queryFn: () => catalogApi.home(),
  });
  const popular = useQuery({
    queryKey: ["popular", zoneId],
    enabled: Boolean(zoneId),
    queryFn: () => catalogApi.popular(),
  });
  const trending = useQuery({
    queryKey: ["trending", zoneId],
    enabled: Boolean(zoneId),
    queryFn: () => catalogApi.trending(),
  });
  const recommended = useQuery({
    queryKey: ["recommended", zoneId],
    enabled: Boolean(zoneId),
    queryFn: () => catalogApi.recommended(),
  });
  const nearby = useQuery({
    queryKey: ["nearby", zoneId, lat, lng],
    enabled: Boolean(zoneId && lat && lng),
    queryFn: () => catalogApi.services(1, { lat: String(lat), long: String(lng) }),
  });

  if (!zoneId) {
    return (
      <EmptyState
        title="Choose a location"
        description="We need your area to show rentals and services available in your zone."
      />
    );
  }

  const bannerItems = list<Banner>(banners.data);
  const campaignItems = list<Campaign>(campaigns.data);
  const nearbyItems = list<Service>(nearby.data);

  return (
    <div className="space-y-10">
      {banners.isError ? (
        <ErrorState message="Could not load banners" onRetry={() => banners.refetch()} />
      ) : null}

      {bannerItems.length > 0 ? (
        <BannerCarousel banners={bannerItems} />
      ) : banners.isLoading ? (
        <div className="h-44 animate-pulse rounded-lg bg-line" />
      ) : null}

      {campaignItems.length > 0 ? (
        <section>
          <h2 className="mb-4 text-xl font-extrabold">Latest campaigns</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {campaignItems.map((c) => (
              <Link
                key={c.id}
                href={`/search?campaign=${c.id}`}
                className="card min-w-[220px] overflow-hidden"
              >
                <SafeImage
                  src={mediaFallbacks(
                    c.thumbnail || c.cover_image || c.image,
                    "campaign",
                    imageBase,
                  )}
                  alt={c.title || "Campaign"}
                  className="h-28 w-full"
                />
                <p className="p-3 text-sm font-semibold">{c.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <HomeSection
        title="Featured ads"
        href="/search?featured=yes"
        query={featured}
        items={featured.data?.featured_ads ?? []}
      />

      <HomeSection title="Near you" href="/search?sort=nearby" query={nearby} items={nearbyItems} />
      <HomeSection
        title="Popular"
        href="/search?sort=popular"
        query={popular}
        items={list<Service>(popular.data)}
      />
      <HomeSection
        title="Trending"
        href="/search?sort=trending"
        query={trending}
        items={list<Service>(trending.data)}
      />
      <HomeSection
        title="Recommended"
        href="/search?sort=recommended"
        query={recommended}
        items={list<Service>(recommended.data)}
      />
    </div>
  );
}

function HomeSection({
  title,
  href,
  query,
  items,
}: {
  title: string;
  href: string;
  query: { isLoading: boolean; isError: boolean; refetch: () => void };
  items: Service[];
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-extrabold">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-brand">
          View all <span aria-hidden="true">→</span>
        </Link>
      </div>
      {query.isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState
          message={`Could not load ${title.toLowerCase()}`}
          onRetry={() => query.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={`No ${title.toLowerCase()} ads in this zone`}
          description="Try another location or check back soon."
        />
      ) : (
        <ServiceGrid services={items} />
      )}
    </section>
  );
}
