"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { providerApi } from "@/lib/api";
import { serviceImageSources } from "@/lib/media";
import { SafeImage } from "@/components/ui/safe-image";
import { EmptyState } from "@/components/ui/states";
import type { Service } from "@/types";

export default function MyAdsPage() {
  const q = useQuery({
    queryKey: ["my-ads"],
    queryFn: () => providerApi.myAds(),
  });
  const payload = q.data as { content?: Service[] } | Service[] | undefined;
  const items = (Array.isArray(payload) ? payload : payload?.content || []) as Service[];
  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My ads</h1>
        <Link href="/post-ad" className="btn-post">
          Post ad
        </Link>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((s) => (
          <Link key={s.id} href={`/service/${s.id}`} className="card flex gap-3 p-3">
            <SafeImage src={serviceImageSources(s)} alt={s.name} className="h-20 w-20 rounded-md" />
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-sm text-muted">{s.availability}</p>
            </div>
          </Link>
        ))}
      </div>
      {q.isFetched && items.length === 0 ? <EmptyState title="You have not posted any ads" className="mt-6" /> : null}
    </div>
  );
}
