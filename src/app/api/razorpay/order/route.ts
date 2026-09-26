import { NextResponse } from "next/server";

/**
 * Booking orders are created on Laravel so the secret never leaves the API
 * and the amount matches cart_total.
 * POST /api/v1/customer/booking/request/razorpay
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Create the booking order with POST /api/v1/customer/booking/request/razorpay using the customer bearer token.",
    },
    { status: 410 },
  );
}
