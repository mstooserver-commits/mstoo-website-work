import CategoriesPage from "./page-client";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "All categories",
  description: "Browse MSTOO rental categories with images for clothes, vehicles, property, equipment and more.",
  path: "/categories",
});

export default function Page() {
  return <CategoriesPage />;
}
