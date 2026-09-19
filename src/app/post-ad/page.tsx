import { PostAdForm } from "@/components/post-ad/post-ad-form";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Post an ad",
  description: "List an item or service for rent on MSTOO with photos, price, location and category details.",
  path: "/post-ad",
  noIndex: true,
});

export default function PostAdPage() {
  return <PostAdForm />;
}
