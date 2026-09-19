import { pageMeta } from "@/lib/seo";
import Link from "next/link";

export const metadata = pageMeta({
  title: "Help & Support",
  description: "Contact MSTOO support for bookings, ads, payments and account help.",
  path: "/support",
});

const CONTACTS = [
  { label: "Support", value: "support@mstoo.co.in", href: "mailto:support@mstoo.co.in" },
  { label: "Sales", value: "sales@mstoo.co.in", href: "mailto:sales@mstoo.co.in" },
  { label: "Info", value: "info@mstoo.co.in", href: "mailto:info@mstoo.co.in" },
  { label: "WhatsApp", value: "+91 62801 16008", href: "https://wa.me/916280116008" },
];

const FAQS = [
  {
    q: "How do I change my location?",
    a: "Use the location control in the header. Search for an area or allow device location. Ads, categories and providers are shown only for your service zone.",
  },
  {
    q: "How do I post an ad?",
    a: "Open Post Ad, choose a category, add photos, price, availability and pickup or service details, then publish. Listing is free. Optional featured placement can be purchased where offered.",
  },
  {
    q: "How do bookings and payments work?",
    a: "Open a listing, pick dates or a slot, confirm the address and pay with Razorpay, wallet or another method shown at checkout. Track status under Bookings.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes, while the booking status still allows it. Open Bookings, select the order and tap Cancel. Refunds follow the Cancellation and Refund policies.",
  },
  {
    q: "A payment succeeded but my booking did not update.",
    a: "Wait a few minutes, then refresh Bookings. If it is still missing, email support@mstoo.co.in with the Razorpay payment ID and listing name.",
  },
  {
    q: "How do wallet and points work?",
    a: "Wallet stores unused or refunded balance you can apply at checkout. Loyalty points, where enabled in your zone, can offset part of a payment. Neither is transferable between accounts.",
  },
];

export default function SupportPage() {
  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-bold">Help &amp; Support</h1>
      <p className="mt-3 text-[15px] leading-7 text-ink/90">
        Need help with a booking, posting an ad, a payment, or your account? The MSTOO team is available 9:00–18:00 IST,
        Monday to Saturday (excluding public holidays).
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {CONTACTS.map((item) => (
          <a key={item.label} href={item.href} className="card p-4 text-sm hover:border-brand/40" target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{item.label}</p>
            <p className="mt-1 font-medium text-brand">{item.value}</p>
          </a>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-bold">Common questions</h2>
      <div className="cms-content mt-4">
        {FAQS.map((item) => (
          <section key={item.q} className="mb-6">
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </section>
        ))}
      </div>

      <h2 className="mt-4 text-xl font-bold">Policies</h2>
      <p className="mt-3 text-[15px] leading-7 text-ink/90">
        Read our{" "}
        <Link href="/terms" className="font-medium text-brand hover:underline">
          Terms
        </Link>
        ,{" "}
        <Link href="/privacy" className="font-medium text-brand hover:underline">
          Privacy Policy
        </Link>
        ,{" "}
        <Link href="/refund" className="font-medium text-brand hover:underline">
          Refund Policy
        </Link>{" "}
        and{" "}
        <Link href="/cancellation" className="font-medium text-brand hover:underline">
          Cancellation Policy
        </Link>
        .
      </p>
    </div>
  );
}
