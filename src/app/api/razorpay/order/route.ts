import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/constants";

type RazorpayConfig = {
  razorpay_key?: string;
  razorpayKey?: string;
  razorpay_secret?: string;
  razorpaySecret?: string;
};

async function backendCredentials(): Promise<{ keyId: string; secret: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/customer/config`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (response.ok) {
      const payload = (await response.json()) as { content?: RazorpayConfig } & RazorpayConfig;
      const config = payload.content ?? payload;
      const keyId = config.razorpay_key ?? config.razorpayKey ?? "";
      const secret = config.razorpay_secret ?? config.razorpaySecret ?? "";
      if (keyId && secret) return { keyId, secret };
    }
  } catch {
    // Use server environment values if the backend config is temporarily unavailable.
  }

  return {
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
    secret: process.env.RAZORPAY_KEY_SECRET ?? "",
  };
}

export async function POST(req: NextRequest) {
  const { keyId, secret } = await backendCredentials();
  if (!keyId || !secret) {
    return NextResponse.json(
      {
        error:
          "Razorpay keys are not configured on the server. Set NEXT_PUBLIC_RAZORPAY_KEY and RAZORPAY_KEY_SECRET.",
      },
      { status: 400 },
    );
  }

  const {
    amount,
    currency = "INR",
    receipt,
  } = (await req.json()) as {
    amount: number;
    currency?: string;
    receipt?: string;
  };

  const auth = Buffer.from(`${keyId}:${secret}`).toString("base64");
  const upstream = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency,
      receipt: receipt ?? `mstoo-${Date.now()}`,
    }),
  });

  const json = (await upstream.json()) as Record<string, unknown>;
  if (!upstream.ok) return NextResponse.json(json, { status: upstream.status });
  return NextResponse.json({ ...json, key: keyId }, { status: upstream.status });
}
