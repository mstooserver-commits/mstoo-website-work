import { IMAGE_BASE_FALLBACKS } from "@/lib/constants";
import type { Banner, Category, Service } from "@/types";

const FOLDERS: Record<string, string> = {
  service: "service",
  category: "category",
  banner: "banner",
  campaign: "campaign",
  provider: "provider/logo",
  profile: "user/profile_image",
  business: "business",
  conversation: "conversation",
};

function unique(urls: string[]) {
  return Array.from(new Set(urls.map((url) => url.trim()).filter(Boolean)));
}

function hostSwapped(url: string) {
  const urls = [url];
  if (url.includes("preprod.mstoo.co.in")) {
    urls.push(url.replace("preprod.mstoo.co.in", "api.mstoo.co.in"));
  } else if (url.includes("api.mstoo.co.in")) {
    urls.push(url.replace("api.mstoo.co.in", "preprod.mstoo.co.in"));
  }
  return urls;
}

function allBases(imageBaseUrl?: string | null) {
  return unique([
    ...IMAGE_BASE_FALLBACKS,
    imageBaseUrl?.replace(/\/$/, "") || "",
  ]);
}

function join(base: string, folder: string, raw: string) {
  const path = raw.replace(/^\//, "");
  if (path.startsWith("storage/app/public/")) {
    return `${base}/${path.replace("storage/app/public/", "")}`;
  }
  if (path.startsWith("storage/")) {
    return `${base}/${path.replace("storage/", "")}`;
  }
  if (path.includes("/")) {
    return `${base}/${path}`;
  }
  const dir = FOLDERS[folder] ?? folder;
  return `${base}/${dir}/${path}`;
}

export function mediaFallbacks(
  fileOrUrl?: string | null,
  folder: keyof typeof FOLDERS | string = "service",
  imageBaseUrl?: string | null,
) {
  const raw = (fileOrUrl ?? "").trim();
  if (!raw || raw === "null") return [];
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return unique(hostSwapped(raw));
  }
  const urls: string[] = [];
  for (const base of allBases(imageBaseUrl)) {
    urls.push(...hostSwapped(join(base, folder, raw)));
  }
  return unique(urls);
}

export function mediaUrl(
  fileOrUrl?: string | null,
  folder: keyof typeof FOLDERS | string = "service",
  imageBaseUrl?: string | null,
) {
  return mediaFallbacks(fileOrUrl, folder, imageBaseUrl)[0] || "";
}

export function categoryImage(
  category?: Pick<Category, "image" | "image_full_url"> | null,
  imageBaseUrl?: string | null,
) {
  if (!category) return [];
  return unique([
    ...mediaFallbacks(category.image_full_url, "category", imageBaseUrl),
    ...mediaFallbacks(category.image, "category", imageBaseUrl),
  ]);
}

export function bannerImage(banner: Banner, imageBaseUrl?: string | null) {
  return unique([
    ...mediaFallbacks(banner.banner_image_full_url, "banner", imageBaseUrl),
    ...mediaFallbacks(banner.banner_image, "banner", imageBaseUrl),
    ...mediaFallbacks(banner.service?.cover_image_full_url, "service", imageBaseUrl),
    ...mediaFallbacks(banner.service?.cover_image, "service", imageBaseUrl),
    ...mediaFallbacks(banner.service?.thumbnail_full_url, "service", imageBaseUrl),
    ...mediaFallbacks(banner.service?.thumbnail, "service", imageBaseUrl),
    ...categoryImage(banner.category, imageBaseUrl),
  ]);
}

export function bannerHref(banner: Banner) {
  if (banner.resource_type === "service" && banner.resource_id) {
    return `/service/${banner.resource_id}`;
  }
  if (banner.resource_type === "category" && banner.resource_id) {
    return `/category/${banner.resource_id}`;
  }
  if (banner.redirect_link) return banner.redirect_link;
  return "/search";
}

export function serviceImageSources(
  service: {
    cover_image_full_url?: string | null;
    thumbnail_full_url?: string | null;
    cover_image?: string | null;
    thumbnail?: string | null;
  },
  imageBaseUrl?: string | null,
) {
  return unique([
    ...mediaFallbacks(service.cover_image_full_url, "service", imageBaseUrl),
    ...mediaFallbacks(service.thumbnail_full_url, "service", imageBaseUrl),
    ...mediaFallbacks(service.cover_image, "service", imageBaseUrl),
    ...mediaFallbacks(service.thumbnail, "service", imageBaseUrl),
  ]);
}

export function serviceImage(service: {
  cover_image_full_url?: string | null;
  thumbnail_full_url?: string | null;
  cover_image?: string | null;
  thumbnail?: string | null;
}) {
  return serviceImageSources(service)[0] || "";
}
