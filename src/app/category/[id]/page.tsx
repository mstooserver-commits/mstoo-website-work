import { Suspense } from "react";
import CategoryPage from "./page-client";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="container-page py-8 text-sm text-muted">Loading category…</div>}>
      <CategoryPage params={params} />
    </Suspense>
  );
}
