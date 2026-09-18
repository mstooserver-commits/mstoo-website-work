"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { useConfigStore } from "@/lib/stores/config";
import { isFlagOn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/states";

export default function BlogsPage() {
  const enabled = isFlagOn(useConfigStore((s) => s.config)?.blog_section_enabled);
  const q = useQuery({
    queryKey: ["blogs"],
    enabled,
    queryFn: () => catalogApi.blogs(1),
  });
  const items = ((q.data as { data?: { id: string; title?: string; slug?: string; excerpt?: string }[] })?.data || []) as {
    id: string;
    title?: string;
    slug?: string;
    excerpt?: string;
  }[];
  if (!enabled) {
    return (
      <div className="container-page py-12">
        <EmptyState title="Blog is currently off" />
      </div>
    );
  }
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">Blog</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((b) => (
          <article key={b.id} className="card p-4">
            <h2 className="font-semibold">{b.title}</h2>
            <p className="mt-2 text-sm text-muted">{b.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
