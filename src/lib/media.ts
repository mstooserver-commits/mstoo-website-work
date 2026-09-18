import { IMAGE_BASE_FALLBACKS } from "@/lib/constants";

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

export function mediaUrl(
  fileOrUrl?: string | null,
  folder: keyof typeof FOLDERS | string = "service",
  imageBaseUrl?: string | null,
) {
  const raw = (fileOrUrl ?? "").trim();
  if (!raw || raw === "null") return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  const bases = [
    imageBaseUrl?.replace(/\/$/, ""),
    ...IMAGE_BASE_FALLBACKS,
  ].filter(Boolean) as string[];

  const path = raw.replace(/^\//, "");
  if (path.startsWith("storage/app/public/")) {
    return `${bases[0]}/${path.replace("storage/app/public/", "")}`;
  }
  if (path.startsWith("storage/")) {
    return `${bases[0]}/${path.replace("storage/", "")}`;
  }
  if (path.includes("/")) {
    return `${bases[0]}/${path}`;
  }
  const dir = FOLDERS[folder] ?? folder;
  return `${bases[0]}/${dir}/${path}`;
}

export function mediaFallbacks(
  fileOrUrl?: string | null,
  folder: keyof typeof FOLDERS | string = "service",
  imageBaseUrl?: string | null,
) {
  const first = mediaUrl(fileOrUrl, folder, imageBaseUrl);
  if (!first) return [];
  const urls = [first];
  if (first.includes("preprod.mstoo.co.in")) {
    urls.push(first.replace("preprod.mstoo.co.in", "api.mstoo.co.in"));
  } else if (first.includes("api.mstoo.co.in")) {
    urls.push(first.replace("api.mstoo.co.in", "preprod.mstoo.co.in"));
  }
  return urls;
}

export function serviceImage(service: {
  cover_image_full_url?: string | null;
  thumbnail_full_url?: string | null;
  cover_image?: string | null;
  thumbnail?: string | null;
}) {
  return (
    service.cover_image_full_url ||
    service.thumbnail_full_url ||
    mediaUrl(service.cover_image || service.thumbnail, "service")
  );
}
