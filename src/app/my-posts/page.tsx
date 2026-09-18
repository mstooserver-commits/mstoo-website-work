"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { customPostApi } from "@/lib/api";
import { useConfigStore } from "@/lib/stores/config";
import { isFlagOn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/states";

export default function MyPostsPage() {
  const enabled = isFlagOn(useConfigStore((s) => s.config)?.bidding_status);
  const q = useQuery({
    queryKey: ["my-posts"],
    enabled,
    queryFn: () => customPostApi.mine(1),
  });
  if (!enabled) {
    return (
      <div className="container-page py-12">
        <EmptyState title="Custom posts are turned off" description="Bidding is disabled in app config." />
      </div>
    );
  }
  const items = ((q.data as { data?: { id: string; service_description?: string }[] })?.data || []) as {
    id: string;
    service_description?: string;
  }[];
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">My custom posts</h1>
      <div className="mt-6 space-y-3">
        {items.map((p) => (
          <Link key={p.id} href={`/my-posts`} className="card block p-4">
            {p.service_description || p.id}
          </Link>
        ))}
        {items.length === 0 ? <EmptyState title="No custom posts yet" /> : null}
      </div>
    </div>
  );
}
