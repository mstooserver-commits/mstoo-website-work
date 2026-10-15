"use client";

import Link from "next/link";
import { servicePriceLabel } from "@/lib/currency";
import { serviceImageSources } from "@/lib/media";
import type { Service } from "@/types";
import { SafeImage } from "@/components/ui/safe-image";
import { MapPin, ShoppingBag, Star } from "lucide-react";

export function ServiceCard({ service }: { service: Service }) {
  const href = `/service/${service.id}`;
  const img = serviceImageSources(service);
  const featured = service.is_featured === "yes" || service.is_featured === 1;
  return (
    <Link
      href={href}
      className="card group overflow-hidden rounded-xl transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden bg-white">
        <SafeImage
          src={img}
          alt={service.name}
          className="h-full w-full"
          fallback="/cover-img.png"
          fallbackClassName="object-contain"
        />
        {featured ? (
          <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Featured
          </span>
        ) : null}
        {typeof service.distance === "number" ? (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-medium text-white">
            {service.distance.toFixed(1)} km
          </span>
        ) : null}
      </div>
      <div className="space-y-2.5 p-3.5">
        {service.category?.name ? (
          <p className="line-clamp-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
            {service.category.name}
          </p>
        ) : null}
        <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-ink group-hover:text-brand">
          {service.name}
        </h3>
        {service.location || typeof service.distance === "number" ? (
          <p className="flex items-start gap-1.5 text-xs text-muted">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
            <span className="line-clamp-1">
              {service.location || `${service.distance!.toFixed(1)} km away`}
            </span>
          </p>
        ) : null}
        <div className="flex items-end justify-between gap-2 border-t border-line pt-2.5">
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold text-ink">
              {servicePriceLabel(service)}
            </p>
            {service.price_unit ? (
              <p className="text-[11px] text-muted">per {service.price_unit}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted">
            {Number(service.avg_rating) > 0 ? (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                <span className="font-semibold text-ink">
                  {Number(service.avg_rating).toFixed(1)}
                </span>
                {Number(service.rating_count) > 0 ? `(${service.rating_count})` : ""}
              </span>
            ) : null}
            {Number(service.order_count) > 0 ? (
              <span className="flex items-center gap-1 border-l border-line pl-2">
                <ShoppingBag className="h-3.5 w-3.5" />
                {service.order_count}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
