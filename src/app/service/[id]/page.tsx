import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ENDPOINTS } from "@/lib/constants";
import { serverFetch } from "@/lib/api/server";
import { pageMeta, serviceJsonLd } from "@/lib/seo";
import { stripHtml } from "@/lib/utils";
import { serviceImage } from "@/lib/media";
import type { Service } from "@/types";
import { ServiceDetailView } from "@/components/service/service-detail-view";

export const revalidate = 120;

async function loadService(id: string) {
  try {
    return await serverFetch<Service>(`${ENDPOINTS.serviceDetail}/${id}`, { revalidate: 120 });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const service = await loadService(params.id);
  if (!service) {
    return pageMeta({ title: "Ad not found", description: "This MSTOO listing is unavailable.", path: `/service/${params.id}` });
  }
  const desc = stripHtml(service.short_description || service.description) || `Rent ${service.name} on MSTOO`;
  return pageMeta({
    title: service.name,
    description: desc.slice(0, 160),
    path: `/service/${params.id}`,
    image: serviceImage(service),
  });
}

export default async function ServicePage({ params }: { params: { id: string } }) {
  const service = await loadService(params.id);
  if (!service) notFound();
  const jsonLd = serviceJsonLd({
    id: service.id,
    name: service.name,
    description: service.description,
    image: serviceImage(service),
    price: service.price,
    location: service.location,
  });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ServiceDetailView service={service} />
    </>
  );
}
