import { MetadataRoute } from "next";
import { API_BASE_URL, APP_URL, ENDPOINTS, ZONE_HEADER } from "@/lib/constants";
import type { Paginated, Service } from "@/types";

const STATIC_PATHS = [
  "/",
  "/search",
  "/offers",
  "/providers",
  "/about",
  "/terms",
  "/privacy",
  "/refund",
  "/cancellation",
  "/support",
  "/blogs",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_PATHS.map((path) => ({
    url: `${APP_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "/" ? 1 : 0.6,
  }));

  let services: Service[] = [];
  try {
    const res = await fetch(`${API_BASE_URL}${ENDPOINTS.service}?limit=100&offset=1`, {
      headers: { Accept: "application/json", [ZONE_HEADER]: "configuration" },
      next: { revalidate: 3600 },
    });
    const json = (await res.json()) as { content?: Paginated<Service> };
    services = json.content?.data ?? [];
  } catch {
    services = [];
  }

  const serviceEntries = services.map((s) => ({
    url: `${APP_URL}/service/${s.id}`,
    lastModified: typeof s.updated_at === "string" ? new Date(s.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...serviceEntries];
}
