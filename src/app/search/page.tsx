import { pageMeta } from "@/lib/seo";
import { Suspense } from "react";
import SearchClient from "./search-client";
import { PageSpinner } from "@/components/ui/skeleton";

export const metadata = pageMeta({
  title: "Search rentals & services",
  description: "Filter MSTOO ads by keyword, price and your current zone.",
  path: "/search",
});

export default function Page() {
  return (
    <Suspense fallback={<PageSpinner label="Searching" />}>
      <SearchClient />
    </Suspense>
  );
}
