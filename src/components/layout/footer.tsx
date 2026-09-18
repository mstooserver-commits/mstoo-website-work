import Link from "next/link";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refund", label: "Refund" },
  { href: "/cancellation", label: "Cancellation" },
  { href: "/support", label: "Help & Support" },
  { href: "/blogs", label: "Blog" },
  { href: "/pro-member", label: "Pro Member" },
];

export function Footer() {
  return (
    <footer className="mt-10 border-t border-line bg-white pb-24 md:pb-8">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MSTOO" className="h-10 w-auto" />
          <p className="mt-3 text-sm text-muted">
            Rent, lease and hire anything near you. India&apos;s hybrid classifieds and on-demand booking marketplace.
          </p>
        </div>
        <div>
          <h4 className="font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-brand">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">For customers</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/search" className="hover:text-brand">
                Browse ads
              </Link>
            </li>
            <li>
              <Link href="/bookings" className="hover:text-brand">
                My bookings
              </Link>
            </li>
            <li>
              <Link href="/wallet" className="hover:text-brand">
                Wallet
              </Link>
            </li>
            <li>
              <Link href="/saved" className="hover:text-brand">
                Saved ads
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Get the app</h4>
          <p className="mt-3 text-sm text-muted">
            Same account, same ads, same bookings — on Android, iOS and the web.
          </p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <a className="text-brand hover:underline" href="https://play.google.com/store/apps/details?id=com.mstoo.app">
              Google Play
            </a>
            <a className="text-brand hover:underline" href="https://apps.apple.com/in/app/mstoo-rent-lease-hire/id6479236352">
              App Store
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        All rights reserved © MSTOO
      </div>
    </footer>
  );
}
