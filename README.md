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
| `NEXT_PUBLIC_API_URL` | Laravel host (`https://your-backend-url`) |
| `NEXT_PUBLIC_API_BASE_URL` | Backward-compatible alias for the Laravel host |
| `NEXT_PUBLIC_APP_NAME` | `MSTOO` |
| `NEXT_PUBLIC_CURRENCY` | `INR` |
| `NEXT_PUBLIC_APP_URL` | Canonical site URL (sitemap/OG) |
| `NEXT_PUBLIC_RAZORPAY_KEY` | Public Razorpay key, usually `rzp_test_...` in test mode |
| `RAZORPAY_KEY_SECRET` | Server-only key; never expose this to the browser |

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

## Razorpay booking + wallet flow

The app includes a reusable payment service at `src/lib/api/payment.ts` with the following functions:

- `getConfig()` fetches `GET /api/v1/customer/config` and reads the Razorpay public key.
- `openRazorpayCheckout({ amount, name, description, email, phone, onSuccess, onFailure })` loads the Razorpay checkout script and opens the modal.
- `createBookingWithRazorpay(payload)` submits the booking request with `payment_method: "razor_pay"` and Razorpay metadata.
- `addWalletFund(amount)` sends `POST /api/v1/customer/wallet/add-fund`, then redirects to the returned `payment_url`.

Examples:

- Booking demo: `src/app/payments/booking/page.tsx`
- Wallet top-up demo: `src/app/payments/wallet/page.tsx`
- Reusable hook: `src/hooks/use-razorpay-checkout.ts`
- Reusable button: `src/components/payments/razorpay-checkout-button.tsx`

Typical flow for a booking:

```ts
const payload = {
  payment_method: "razor_pay",
  zone_id: "zone_123",
  service_schedule: "2026-09-27T12:00",
  service_address_id: "address_456",
  razorpay_payment_id: response.razorpay_payment_id,
  razorpay_order_id: response.razorpay_order_id,
  razorpay_signature: response.razorpay_signature,
};

await createBookingWithRazorpay(payload);
```

Typical flow for wallet funding:

```ts
const paymentUrl = await addWalletFund(5000, {
  callback: "/wallet",
  payment_platform: "web",
});
window.location.href = paymentUrl;
```

## Security notes

- Prefer the httpOnly cookie path (implemented). Do not copy JWTs into analytics.
- Razorpay **secret must stay server-side** (`RAZORPAY_KEY_SECRET`). The website does not expose it to the browser.
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
