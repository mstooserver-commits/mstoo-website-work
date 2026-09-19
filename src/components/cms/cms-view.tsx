import { ENDPOINTS } from "@/lib/constants";
import { serverFetch } from "@/lib/api/server";
import { LEGAL_HTML, type LegalSlug } from "@/content/legal";
import { pageMeta } from "@/lib/seo";
import { isFlagOn } from "@/lib/utils";
import type { CmsPage, CmsPages } from "@/types";
import type { Metadata } from "next";

const MAP: Record<string, { key: keyof CmsPages; title: string; path: string; legal: LegalSlug }> = {
  about: { key: "about_us", title: "About us", path: "/about", legal: "about" },
  terms: { key: "terms_and_conditions", title: "Terms and conditions", path: "/terms", legal: "terms" },
  privacy: { key: "privacy_policy", title: "Privacy policy", path: "/privacy", legal: "privacy" },
  refund: { key: "refund_policy", title: "Refund policy", path: "/refund", legal: "refund" },
  cancellation: {
    key: "cancellation_policy",
    title: "Cancellation policy",
    path: "/cancellation",
    legal: "cancellation",
  },
};

const GENERIC_PRIVACY_STUB = /inform visitors regarding our policies with the collection/i;

async function loadPages() {
  try {
    return await serverFetch<CmsPages>(ENDPOINTS.configPages, { revalidate: 3600, zoneId: "configuration" });
  } catch {
    return null;
  }
}

function stripTags(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}

function prepareHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function pageHtml(page: CmsPage | undefined, slug: LegalSlug) {
  const raw = String(page?.live_values || page?.content || "").trim();
  const text = stripTags(raw);
  const fallback = LEGAL_HTML[slug];
  if (text.length < 80) return fallback;
  if (GENERIC_PRIVACY_STUB.test(text) && slug !== "privacy") return fallback;
  if (GENERIC_PRIVACY_STUB.test(text) && slug === "privacy") return fallback;
  if (slug === "refund" && /featured ads package/i.test(text) && !/refund/i.test(text)) return fallback;
  return prepareHtml(raw);
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
    <article className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-bold">{page?.title || meta.title}</h1>
      <div className="cms-content mt-6" dangerouslySetInnerHTML={{ __html: pageHtml(page, meta.legal) }} />
    </article>
  );
}
