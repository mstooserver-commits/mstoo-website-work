import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_URL } from "@/lib/constants";
import { pageMeta, localBusinessJsonLd } from "@/lib/seo";
import { AppProviders } from "@/components/layout/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LocationPicker } from "@/components/location/location-picker";
import { LocationGate } from "@/components/location/location-gate";
import { MaintenanceBanner } from "@/components/layout/maintenance-banner";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  ...pageMeta({
    title: `${APP_NAME} — Rent Lease & Hire`,
    description:
      "Browse rentals and services near you. Post ads, book on-demand, pay digitally, and manage bookings on MSTOO.",
    path: "/",
  }),
  metadataBase: new URL(APP_URL),
  applicationName: APP_NAME,
  keywords: ["MSTOO", "rent", "lease", "hire", "classifieds", "India", "on-demand booking"],
  manifest: "/manifest.json",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#D93F46",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className={`${font.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
        <AppProviders>
          <MaintenanceBanner />
          <Header />
          <LocationGate />
          <LocationPicker />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
          <BottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
