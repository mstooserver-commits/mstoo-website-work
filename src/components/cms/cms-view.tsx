import { ENDPOINTS } from "@/lib/constants";
import { serverFetch } from "@/lib/api/server";
import { pageMeta } from "@/lib/seo";
import { isFlagOn } from "@/lib/utils";
import type { CmsPage, CmsPages } from "@/types";
import type { Metadata } from "next";

const MAP: Record<string, { key: keyof CmsPages; title: string; path: string }> = {
  about: { key: "about_us", title: "About us", path: "/about" },
  terms: { key: "terms_and_conditions", title: "Terms and conditions", path: "/terms" },
  privacy: { key: "privacy_policy", title: "Privacy policy", path: "/privacy" },
  refund: { key: "refund_policy", title: "Refund policy", path: "/refund" },
  cancellation: { key: "cancellation_policy", title: "Cancellation policy", path: "/cancellation" },
};

async function loadPages() {
  try {
    return await serverFetch<CmsPages>(ENDPOINTS.configPages, { revalidate: 3600, zoneId: "configuration" });
  } catch {
    return null;
  }
}

export function cmsMetadata(slug: keyof typeof MAP): Promise<Metadata> {
  return (async () => {
    const pages = await loadPages();
    const meta = MAP[slug];
    const page = pages?.[meta.key] as CmsPage | undefined;
    return pageMeta({
      title: page?.title || meta.title,
      description: `${meta.title} for MSTOO.`,
      path: meta.path,
    });
  })();
}

export async function CmsView({ slug }: { slug: keyof typeof MAP }) {
  const pages = await loadPages();
  const meta = MAP[slug];
  const page = pages?.[meta.key] as CmsPage | undefined;
  if (page && page.is_active !== undefined && !isFlagOn(page.is_active)) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold">This page is currently unavailable</h1>
      </div>
    );
  }
  return (
    <article className="container-page prose max-w-3xl py-10">
      <h1>{page?.title || meta.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page?.content || "<p>Content will appear here once published in admin.</p>" }} />
    </article>
  );
}
