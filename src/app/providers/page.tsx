"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { providerApi } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import { useLocationStore } from "@/lib/stores/location";
import { SafeImage } from "@/components/ui/safe-image";
import { EmptyState } from "@/components/ui/states";
import type { Paginated, Provider } from "@/types";

export default function ProvidersPage() {
  const zoneId = useLocationStore((s) => s.location?.zoneId);
  const q = useQuery({
    queryKey: ["providers", zoneId],
    enabled: Boolean(zoneId),
    queryFn: () => providerApi.list(1),
  });
  const items = ((q.data as Paginated<Provider>)?.data || []) as Provider[];
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">Providers</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Link key={p.id} href={`/provider/${p.id}`} className="card flex items-center gap-3 p-4">
            <SafeImage src={p.logo_full_url || mediaUrl(p.logo, "provider")} alt={p.company_name || "Provider"} className="h-14 w-14 rounded-full" />
            <div>
              <p className="font-semibold">{p.company_name}</p>
              <p className="text-sm text-muted">{p.address}</p>
            </div>
          </Link>
        ))}
      </div>
      {q.isFetched && items.length === 0 ? <EmptyState title="No providers in this zone" className="mt-6" /> : null}
    </div>
  );
}
