import { HomeFeed } from "@/components/home/home-feed";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Rent, lease & hire near you",
  description:
    "Find rentals and on-demand services in your zone. Post ads, book instantly, and pay with Razorpay on MSTOO.",
  path: "/",
});

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="container-page py-10 sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">India&apos;s rental marketplace</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-extrabold sm:text-4xl">
            Rent anything. Hire anyone. Right in your neighbourhood.
          </h1>
          <p className="mt-3 max-w-xl text-white/90">
            Clothes, vehicles, property, equipment and local services — discovered from your current location, just like
            the MSTOO app.
          </p>
        </div>
      </section>
      <div className="container-page py-8">
        <HomeFeed />
      </div>
    </div>
  );
}
