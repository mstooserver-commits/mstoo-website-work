# MSTOO Website

Production-ready Next.js 14 (App Router) website for **MSTOO** — India’s hybrid rental / classifieds + on-demand booking marketplace. It mirrors the Flutter app and talks to the same Laravel APIs at `https://preprod.mstoo.co.in`.

Brand: **MSTOO · Rent Lease & Hire** · currency **INR (₹)** · country **India**.

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS (MSTOO red / navy tokens from the Flutter app)
- TanStack Query + Zustand
- Zod + React Hook Form
- Next.js Metadata API, sitemap, robots
- Leaflet map picker + backend place autocomplete
- Razorpay web checkout
- Same-origin `/api/proxy` BFF (auth httpOnly cookie + `zoneId` header)

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Laravel host (`https://preprod.mstoo.co.in`) |
| `NEXT_PUBLIC_APP_NAME` | `MSTOO` |
| `NEXT_PUBLIC_CURRENCY` | `INR` |
| `NEXT_PUBLIC_APP_URL` | Canonical site URL (sitemap/OG) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay key (optional if present in `/customer/config`) |
| `RAZORPAY_KEY_SECRET` | Server-only order creation |

Auth JWT is stored in an **httpOnly** `mstoo_token` cookie via `/api/auth/session` and the proxy. Zone + lat/lng are stored in `localStorage` (`mstoo.location`) and readable cookies so listing APIs send the same `zoneId` header as the Flutter `ApiClient`.

## Location-first home

1. Browser geolocation (fallback: location picker + New Delhi default from config).
2. `GET /api/v1/customer/config/get-zone-id?lat=&lng=`
3. Persist address / lat / lng / zone_id.
4. Home listings (banners, categories, nearby/popular/trending) only load for that zone.
5. Header location chip uses place autocomplete + place details + geocode, then refreshes queries.

## Feature flags

Boot calls `GET /api/v1/customer/config`. Menus for wallet, points, bidding, Pro, cash-after-service, digital payment, social login, CMS pages and blog respect those flags. Do not hardcode availability.

## Deploy (Vercel)

1. Push this repo and import in Vercel.
2. Set the env vars above (`NEXT_PUBLIC_APP_URL` = production domain).
3. Add image hostnames `preprod.mstoo.co.in` and `api.mstoo.co.in` (already in `next.config.mjs`).
4. Production checkout: set Razorpay live key + secret.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Security notes

- Prefer the httpOnly cookie path (implemented). Do not copy JWTs into analytics.
- Razorpay **secret must stay server-side** (`RAZORPAY_KEY_SECRET`). The Flutter app currently reads a secret from config — the website does not expose it to the browser.
- `/api/proxy` forwards `Authorization` + `zoneId` to Laravel and never logs tokens.

## Test plan

See the checklist in this README below.

### Smoke checklist

- [ ] First visit: location prompt / picker; cannot fully browse until zone is set
- [ ] Default New Delhi fallback works when permission is denied
- [ ] Header shows current address; changing place refreshes home ads
- [ ] Home: banners, categories, nearby ads for the selected zone
- [ ] Empty zone state if no ads
- [ ] Service detail: unique title, OG image, JSON-LD, book + chat CTAs
- [ ] Search + category listings stay zone-scoped
- [ ] Register / login / OTP / forgot password (phone E.164 +91)
- [ ] Guest blocked from checkout, post-ad, chat, wallet (middleware)
- [ ] Cart → checkout → Razorpay / wallet / COD based on config flags
- [ ] Bookings list/detail cancel-reschedule-complete-review
- [ ] Post Ad multipart + My Ads
- [ ] Addresses with map pin + zone validation
- [ ] Wallet / points / Pro member hidden when flags are 0
- [ ] Chat polling (~4s)
- [ ] CMS pages from `/config/pages` with `is_active`
- [ ] `sitemap.xml` + `robots.txt`
- [ ] Mobile sticky bottom nav; desktop header + search
- [ ] Lighthouse / Core Web Vitals: no huge client bundle on first paint for CMS/service SSR
