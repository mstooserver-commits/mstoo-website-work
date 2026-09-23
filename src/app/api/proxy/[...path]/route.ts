import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, COOKIES, LOCALIZATION_HEADER, ZONE_HEADER } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function tokenFrom(req: NextRequest) {
  return req.cookies.get(COOKIES.token)?.value;
}

function zoneFrom(req: NextRequest) {
  return req.headers.get(ZONE_HEADER) || req.cookies.get(COOKIES.zone)?.value || "";
}

function targetUrl(path: string[], req: NextRequest) {
  const joined = path.join("/");
  const url = new URL(`${API_BASE_URL}/${joined}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  return url;
}

function laravelHeaders(req: NextRequest, contentType?: string | null) {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set(LOCALIZATION_HEADER, req.headers.get(LOCALIZATION_HEADER) || "en");
  const zone = zoneFrom(req);
  headers.set(ZONE_HEADER, zone || "configuration");
  const token = tokenFrom(req);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (contentType && !contentType.includes("multipart/form-data")) {
    headers.set("Content-Type", contentType);
  }
  return headers;
}

function extractToken(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const body = payload as Record<string, unknown>;
  const content = (body.content ?? body) as Record<string, unknown>;
  const token = content?.token ?? content?.access_token ?? body.token;
  return typeof token === "string" ? token : undefined;
}

async function forward(req: NextRequest, path: string[]) {
  const url = targetUrl(path, req);
  const contentType = req.headers.get("content-type");
  const method = req.method;

  let body: BodyInit | undefined;
  if (method !== "GET" && method !== "HEAD") {
    if (contentType?.includes("multipart/form-data")) {
      body = await req.formData();
    } else if (contentType?.includes("application/json")) {
      const json = await req.text();
      body = json || undefined;
    } else {
      body = await req.arrayBuffer();
    }
  }

  const upstream = await fetch(url, {
    method,
    headers: laravelHeaders(req, contentType),
    body,
    cache: "no-store",
  });

  const text = await upstream.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  const response = new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
    },
  });

  const joined = path.join("/");
  const isAuthPath =
    joined.includes("customer/auth/") || joined.includes("user/verification/verify-otp");
  const token = extractToken(json);
  if (isAuthPath && token && upstream.ok) {
    response.cookies.set(COOKIES.token, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  const unverified =
    json &&
    typeof json === "object" &&
    ((json as { response_code?: string }).response_code === "unverified_phone_401" ||
      (json as { response_code?: string }).response_code === "unverified_email_401");

  if (upstream.status === 401 && !unverified) {
    response.cookies.set(COOKIES.token, "", { httpOnly: true, path: "/", maxAge: 0 });
  }

  return response;
}

type Ctx = { params: { path: string[] } };

export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx.params.path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx.params.path);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx.params.path);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx.params.path);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx.params.path);
}
