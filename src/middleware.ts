import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/checkout",
  "/bookings",
  "/wallet",
  "/points",
  "/pro-member",
  "/coupons",
  "/address",
  "/profile",
  "/notifications",
  "/chat",
  "/post-ad",
  "/my-ads",
  "/my-posts",
  "/provider/requests",
  "/provider/bank",
  "/provider/withdraw",
  "/provider/reports",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("mstoo_token")?.value;
  if (token) {
    return NextResponse.next();
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("redirect", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/checkout/:path*",
    "/bookings/:path*",
    "/wallet/:path*",
    "/points/:path*",
    "/pro-member/:path*",
    "/coupons/:path*",
    "/address/:path*",
    "/profile/:path*",
    "/notifications/:path*",
    "/chat/:path*",
    "/post-ad/:path*",
    "/my-ads/:path*",
    "/my-posts/:path*",
    "/provider/requests/:path*",
    "/provider/bank/:path*",
    "/provider/withdraw/:path*",
    "/provider/reports/:path*",
    "/checkout",
    "/bookings",
    "/wallet",
    "/points",
    "/pro-member",
    "/coupons",
    "/address",
    "/profile",
    "/notifications",
    "/chat",
    "/post-ad",
    "/my-ads",
    "/my-posts",
    "/provider/requests",
    "/provider/bank",
    "/provider/withdraw",
    "/provider/reports",
  ],
};
