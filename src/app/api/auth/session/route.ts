import { NextRequest, NextResponse } from "next/server";
import { COOKIES } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIES.token)?.value;
  return NextResponse.json({ loggedIn: Boolean(token) });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { token?: string };
  if (!body.token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIES.token, body.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIES.token, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
