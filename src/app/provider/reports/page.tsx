"use client";

import { useQuery } from "@tanstack/react-query";
import { providerApi } from "@/lib/api";

export default function ReportsPage() {
  const q = useQuery({ queryKey: ["reports"], queryFn: () => providerApi.reports() });
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">Provider reports</h1>
      <pre className="mt-4 overflow-auto rounded-md bg-white p-4 text-xs text-muted">
        {JSON.stringify(q.data, null, 2)}
      </pre>
    </div>
  );
}
