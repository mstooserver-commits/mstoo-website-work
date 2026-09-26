"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPin, Phone, ShoppingCart, Star } from "lucide-react";
import { catalogApi } from "@/lib/api";
import { servicePriceLabel } from "@/lib/currency";
import { serviceImageSources } from "@/lib/media";
import { useAuthStore } from "@/lib/stores/auth";
import { useCartStore } from "@/lib/stores/cart";
import { useConfigStore } from "@/lib/stores/config";
import { isFlagOn } from "@/lib/utils";
import type { Service } from "@/types";
import { SafeImage } from "@/components/ui/safe-image";
import { ServiceGrid } from "@/components/service/service-card";

export function ServiceDetailView({ service }: { service: Service }) {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const addCart = useCartStore((s) => s.add);
  const config = useConfigStore((s) => s.config);
  const [adding, setAdding] = useState<"cart" | "booking" | null>(null);
  const variant =
    service.variations_app_format?.zone_wise_variations?.[0]?.variant_key ||
    service.variations?.[0]?.variant_key ||
    "default";

  const reviews = useQuery({
    queryKey: ["reviews", service.id],
    queryFn: () => catalogApi.reviews(service.id),
  });
  const related = useQuery({
    queryKey: ["related", service.sub_category_id],
    enabled: Boolean(service.sub_category_id),
    queryFn: () => catalogApi.bySubcategory(service.sub_category_id!, 1),
  });

  const addToCart = async (checkout = false) => {
    if (!isLoggedIn) {
      const redirect = checkout ? `/service/${service.id}?book=1` : `/service/${service.id}`;
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }
    setAdding(checkout ? "booking" : "cart");
    try {
      const cartBody = {
        service_id: service.id,
        category_id: service.category_id || "",
        sub_category_id: service.sub_category_id || "",
        variant_key: variant,
        quantity: "1",
      };
      await addCart(cartBody, {
        ...cartBody,
        quantity: 1,
        service_cost: Number(
          service.variations_app_format?.zone_wise_variations?.[0]?.price ??
            service.variations?.[0]?.price ??
            service.price ??
            service.min_price ??
            0,
        ),
        service,
      });
      toast.success("Added to cart");
      if (checkout) router.push("/checkout");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add to cart");
    } finally {
      setAdding(null);
    }
  };

  const relatedItems = (related.data?.data || []).filter((s) => s.id !== service.id).slice(0, 8);
  const reviewItems =
    (reviews.data?.data as
      | {
          id?: string;
          review_comment?: string;
          review_rating?: number;
          customer?: { first_name?: string };
        }[]
      | undefined) || [];

  return (
    <div className="container-page py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white shadow-card">
          <SafeImage
            src={serviceImageSources(service)}
            alt={service.name}
            className="aspect-[4/3] w-full"
          />
        </div>
        <div>
          <p className="text-sm text-brand">{service.category?.name}</p>
          <h1 className="mt-1 text-3xl font-extrabold">{service.name}</h1>
          <p className="mt-3 text-2xl font-bold text-brand">{servicePriceLabel(service)}</p>
          {Number(service.avg_rating) > 0 ? (
            <p className="mt-2 flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-warning text-warning" />
              {Number(service.avg_rating).toFixed(1)} ({service.rating_count} reviews)
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted">No reviews yet</p>
          )}
          {service.location ? (
            <p className="mt-3 flex items-start gap-2 text-sm text-muted">
              <MapPin className="mt-0.5 h-4 w-4 text-brand" />
              {service.location}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="btn-primary"
              disabled={adding !== null}
              onClick={() => void addToCart(true)}
            >
              {adding === "booking" ? "Adding…" : "Book now"}
            </button>
            <button
              className="btn-secondary gap-2"
              disabled={adding !== null}
              onClick={() => void addToCart()}
            >
              <ShoppingCart className="h-4 w-4" />
              {adding === "cart" ? "Adding…" : "Add to cart"}
            </button>
            {service.contact_info && isFlagOn(config?.phone_number_visibility_for_chatting) ? (
              <a className="btn-secondary gap-2" href={`tel:${service.contact_info}`}>
                <Phone className="h-4 w-4" /> Contact
              </a>
            ) : null}
          </div>
          <article className="prose mt-6 max-w-none text-sm text-ink">
            <h2 className="text-base font-semibold">About this listing</h2>
            <p className="whitespace-pre-wrap text-muted">
              {service.description || service.short_description || "No description provided."}
            </p>
          </article>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold">Reviews</h2>
        {reviewItems.length === 0 ? (
          <p className="text-sm text-muted">Be the first to review this listing after a booking.</p>
        ) : (
          <ul className="space-y-3">
            {reviewItems.map((r, i) => (
              <li key={r.id || i} className="card p-4">
                <p className="font-medium">{r.customer?.first_name || "Customer"}</p>
                <p className="text-sm text-muted">{r.review_comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {relatedItems.length > 0 ? (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Related ads</h2>
            {service.sub_category_id ? (
              <Link href={`/category/${service.category_id}`} className="text-sm text-brand">
                See more
              </Link>
            ) : null}
          </div>
          <ServiceGrid services={relatedItems} />
        </section>
      ) : null}
    </div>
  );
}
