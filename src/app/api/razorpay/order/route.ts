import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) {
    return NextResponse.json(
      {
        error:
          "Razorpay keys are not configured on the server. Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      },
      { status: 400 },
    );
  }

  const { amount, currency = "INR", receipt } = (await req.json()) as {
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

  const json = await upstream.json();
  return NextResponse.json(json, { status: upstream.status });
}
