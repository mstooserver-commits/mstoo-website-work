"use client";

import Link from "next/link";
import { servicePriceLabel } from "@/lib/currency";
import { serviceImageSources } from "@/lib/media";
import type { Service } from "@/types";
import { SafeImage } from "@/components/ui/safe-image";
import { MapPin, Star } from "lucide-react";

export function ServiceCard({ service }: { service: Service }) {
  const href = `/service/${service.id}`;
  const img = serviceImageSources(service);
  const featured = service.is_featured === "yes" || service.is_featured === 1;
  return (
    <Link href={href} className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-page">
        <SafeImage src={img} alt={service.name} className="h-full w-full" />
        {featured ? (
          <span className="absolute left-2 top-2 rounded-full bg-post px-2 py-0.5 text-[10px] font-bold uppercase text-navy">
            Featured
          </span>
        ) : null}
        {typeof service.distance === "number" ? (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/65 px-2 py-0.5 text-[10px] text-white">
            {service.distance.toFixed(1)} km
          </span>
        ) : null}
      </div>
      <div className="space-y-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-ink group-hover:text-brand">{service.name}</h3>
        {service.location ? (
          <p className="flex items-start gap-1 text-xs text-muted">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="line-clamp-1">{service.location}</span>
          </p>
        ) : null}
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm font-bold text-brand">{servicePriceLabel(service)}</p>
          {Number(service.avg_rating) > 0 ? (
            <span className="flex items-center gap-0.5 text-xs text-muted">
              <Star className="h-3 w-3 fill-warning text-warning" />
              {Number(service.avg_rating).toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
