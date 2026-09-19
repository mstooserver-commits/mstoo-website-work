"use client";

import Link from "next/link";
import { useConfigStore } from "@/lib/stores/config";

const EMAILS = ["info@mstoo.co.in", "sales@mstoo.co.in", "support@mstoo.co.in"];

const SOCIAL = [
  {
    href: "https://x.com/mstooapp",
    label: "MSTOO on X",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.59l-5.16-6.74L5.2 22H1.94l8.03-9.17L1.5 2h6.75l4.66 6.18L18.244 2Zm-1.16 18.06h1.83L7.01 3.84H5.05l12.03 16.22Z" />
      </svg>
    ),
  },
  {
    href: "https://www.facebook.com/share/1aGpUPDf8a/?mibextid=wwXIfr",
    label: "MSTOO on Facebook",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M13.5 21v-8.1h2.72l.41-3.17H13.5V7.7c0-.92.25-1.54 1.57-1.54H16.8V3.32C16.4 3.26 15.2 3.16 13.8 3.16 10.9 3.16 9 4.93 9 8.36v1.37H6.5v3.17H9V21h4.5Z" />
      </svg>
    ),
  },
  {
    href: "https://www.instagram.com/mstoo_app",
    label: "MSTOO on Instagram",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M7.75 3h8.5A4.75 4.75 0 0 1 21 7.75v8.5A4.75 4.75 0 0 1 16.25 21h-8.5A4.75 4.75 0 0 1 3 16.25v-8.5A4.75 4.75 0 0 1 7.75 3Zm0 1.5A3.25 3.25 0 0 0 4.5 7.75v8.5A3.25 3.25 0 0 0 7.75 19.5h8.5a3.25 3.25 0 0 0 3.25-3.25v-8.5A3.25 3.25 0 0 0 16.25 4.5h-8.5ZM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 1.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm5.25-2.75a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z" />
      </svg>
    ),
  },
  {
    href: "https://youtube.com/@mstooapp?si=fGG1HLRyFbw00m6Y",
    label: "MSTOO on YouTube",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M22.5 7.2a3.1 3.1 0 0 0-2.2-2.2C18.5 4.6 12 4.6 12 4.6s-6.5 0-8.3.4A3.1 3.1 0 0 0 1.5 7.2 32.6 32.6 0 0 0 1.1 12a32.6 32.6 0 0 0 .4 4.8 3.1 3.1 0 0 0 2.2 2.2c1.8.4 8.3.4 8.3.4s6.5 0 8.3-.4a3.1 3.1 0 0 0 2.2-2.2c.3-1.6.4-3.2.4-4.8a32.6 32.6 0 0 0-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z" />
      </svg>
    ),
  },
  {
    href: "https://wa.me/916280116008",
    label: "WhatsApp MSTOO",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M12 2.2A9.8 9.8 0 0 0 3.4 16.9L2 22l5.2-1.37A9.8 9.8 0 1 0 12 2.2Zm0 1.8a8 8 0 0 1 6.8 12.1 7.96 7.96 0 0 1-9.4 2.5l-.34-.18-3.07.8.82-3-.2-.36A8 8 0 0 1 12 4Zm-3.2 4.3c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.07 3.32 5.12 4.52 2.54 1 3.06.8 3.61.76.55-.05 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.12-.27-.2-.57-.35-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.18-.24-.58-.48-.5-.67-.5Z" />
      </svg>
    ),
  },
];

const COMPANY = [
  { href: "/about", label: "About" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refund", label: "Refund" },
  { href: "/cancellation", label: "Cancellation" },
  { href: "/support", label: "Help & Support" },
];

export function Footer() {
  const config = useConfigStore((s) => s.config);
  const playStore =
    config?.app_url_playstore || "https://play.google.com/store/apps/details?id=com.mstoo.app";
  const appStore =
    config?.app_url_appstore || "https://apps.apple.com/in/app/mstoo-rent-lease-hire/id6479236352";

  return (
    <footer className="mt-10 border-t border-line bg-white pb-24 md:pb-8" role="contentinfo">
      <div className="container-page grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="text-base font-bold">About MSTOO</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Connecting communities with seamless rental solutions. Discover local businesses, post ads for free, and
            manage bookings on the go. Experience the convenience and efficiency of MSTOO today!
          </p>
          <p className="mt-4 text-sm text-ink">
            E-mail:{" "}
            {EMAILS.map((email, i) => (
              <span key={email}>
                <a className="text-brand hover:underline" href={`mailto:${email}`}>
                  {email}
                </a>
                {i < EMAILS.length - 1 ? (
                  <>
                    ,<br />
                  </>
                ) : null}
              </span>
            ))}
          </p>
        </div>

        <div>
          <h3 className="text-base font-bold">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {COMPANY.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-base font-bold">Downloads</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={appStore} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                Get from the App Store
              </a>
            </li>
            <li>
              <a href={playStore} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                Get from the Play Store
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-page flex flex-col items-center gap-4 border-t border-line py-6 text-center">
        <p className="flex flex-wrap items-center justify-center gap-3">
          {SOCIAL.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-brand hover:bg-brand-soft hover:text-brand"
            >
              {item.icon}
            </a>
          ))}
        </p>
        <p className="text-sm text-muted">© Copyright MSTOO. All Rights Reserved</p>
      </div>
    </footer>
  );
}
