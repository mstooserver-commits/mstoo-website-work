"use client";

import { useQuery } from "@tanstack/react-query";
import { providerApi } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import { SafeImage } from "@/components/ui/safe-image";
import type { Provider } from "@/types";

export default function ProviderDetailPage({ params }: { params: { id: string } }) {
  const q = useQuery({
    queryKey: ["provider", params.id],
    queryFn: () => providerApi.details(params.id),
  });
  const p = q.data as Provider | undefined;
  if (!p) return <div className="container-page py-16 text-center text-muted">Loading provider…</div>;
  return (
    <div className="container-page py-8">
      <div className="card flex items-center gap-4 p-6">
        <SafeImage src={p.logo_full_url || mediaUrl(p.logo, "provider")} alt={p.company_name || ""} className="h-20 w-20 rounded-full" />
        <div>
          <h1 className="text-2xl font-bold">{p.company_name}</h1>
          <p className="text-muted">{p.address}</p>
          <p className="mt-1 text-sm">Rating {p.avg_rating ?? 0} ({p.rating_count ?? 0})</p>
        </div>
      </div>
    </div>
  );
}
