import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";
import LoginClient from "./login-client";
import { PageSpinner } from "@/components/ui/skeleton";

export const metadata = pageMeta({
  title: "Login",
  description: "Log in to MSTOO with the same account as the mobile app.",
  path: "/login",
  noIndex: true,
});

export default function Page() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <LoginClient />
    </Suspense>
  );
}
