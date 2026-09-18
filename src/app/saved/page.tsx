"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";
import { ServiceGrid } from "@/components/service/service-card";
import { EmptyState } from "@/components/ui/states";
import type { Paginated, Service } from "@/types";
import Link from "next/link";

export default function SavedPage() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const q = useQuery({
    queryKey: ["liked"],
    enabled: isLoggedIn,
    queryFn: () => catalogApi.liked(1),
  });
  const items = ((q.data as Paginated<Service>)?.data || []) as Service[];
  if (!isLoggedIn) {
    return (
      <div className="container-page py-12">
        <EmptyState
          title="Save ads you love"
          description="Log in to see liked listings from the MSTOO app."
          action={
            <Link href="/login?redirect=/saved" className="btn-primary">
              Login
            </Link>
          }
        />
      </div>
    );
  }
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">Saved ads</h1>
      <div className="mt-6">
        {items.length === 0 ? <EmptyState title="No saved ads yet" /> : <ServiceGrid services={items} />}
      </div>
    </div>
  );
}
