import type { Metadata } from "next";
import { APP_NAME, APP_URL } from "@/lib/constants";
import { stripHtml } from "@/lib/utils";

export function pageMeta({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${APP_URL}${path}`;
  const fullTitle = title.includes(APP_NAME) ? title : `${title} | ${APP_NAME}`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: APP_NAME,
      type: "website",
      locale: "en_IN",
      images: image ? [{ url: image }] : [{ url: `${APP_URL}/logo.png` }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: image ? [image] : [`${APP_URL}/logo.png`],
    },
  };
}

export function serviceJsonLd(service: {
  id: string;
  name: string;
  description?: string | null;
  image?: string;
  price?: number | string | null;
  display_price?: string;
  location?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: service.name,
    description: stripHtml(service.description) || service.name,
    image: service.image,
    sku: service.id,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: Number(service.price || 0),
      availability: "https://schema.org/InStock",
      url: `${APP_URL}/service/${service.id}`,
    },
    areaServed: service.location || "India",
    brand: { "@type": "Brand", name: APP_NAME },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: APP_NAME,
    url: APP_URL,
    image: `${APP_URL}/logo.png`,
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    areaServed: "IN",
    description: "India-focused rental, classifieds and on-demand booking marketplace.",
  };
}
