import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Help & Support",
  description: "Contact MSTOO support for bookings, ads, payments and account help.",
  path: "/support",
});

export default function SupportPage() {
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">Help & Support</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Need help with a booking, posting an ad, or a payment? Reach the MSTOO team using the details from the live app
        config.
      </p>
      <div className="mt-6 card max-w-lg space-y-2 p-5 text-sm">
        <p>
          Email:{" "}
          <a className="text-brand" href="mailto:info@mstoo.com">
            info@mstoo.com
          </a>
        </p>
        <p>Hours: 9:00–18:00 IST</p>
      </div>
    </div>
  );
}
