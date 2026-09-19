"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bannerHref, bannerImage } from "@/lib/media";
import { useConfigStore } from "@/lib/stores/config";
import { cn } from "@/lib/utils";
import type { Banner } from "@/types";
import { SafeImage } from "@/components/ui/safe-image";

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const imageBase = useConfigStore((s) => s.config?.image_base_url);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % banners.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) return null;
  const banner = banners[index] ?? banners[0];

  return (
    <section className="space-y-3">
      <Link
        href={bannerHref(banner)}
        className="card relative block overflow-hidden"
      >
        <SafeImage
          src={bannerImage(banner, imageBase)}
          alt={banner.banner_title || "MSTOO offer"}
          className="h-44 w-full sm:h-56"
        />
        {banner.banner_title ? (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 p-4 text-white">
            <p className="font-semibold">{banner.banner_title}</p>
          </div>
        ) : null}
      </Link>
      {banners.length > 1 ? (
        <div className="flex justify-center gap-1.5">
          {banners.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show banner ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn("h-1.5 rounded-full transition", i === index ? "w-5 bg-brand" : "w-1.5 bg-line")}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
