import { HomeFeed } from "@/components/home/home-feed";
import { HomeHero } from "@/components/home/home-hero";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Rent, lease & hire near you",
  description:
    "Find rentals and on-demand services in your zone. Post ads, book instantly, and pay with Razorpay on MSTOO.",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="container-page space-y-8 py-5 md:py-8">
      <HomeHero />
      <div>
        <HomeFeed />
      </div>
    </div>
  );
}
