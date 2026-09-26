"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRazorpayCheckout } from "@/hooks/use-razorpay-checkout";
import { createBookingWithRazorpay, type BookingPaymentPayload } from "@/lib/api/payment";

const defaultSchedule = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

export default function BookingPaymentExamplePage() {
  const router = useRouter();
  const { isLoading, isReady, error, openCheckout } = useRazorpayCheckout();
  const [amount, setAmount] = useState(14900);
  const [zoneId, setZoneId] = useState("zone_123");
  const [serviceAddressId, setServiceAddressId] = useState("address_456");
  const [serviceSchedule, setServiceSchedule] = useState(defaultSchedule);
  const [status, setStatus] = useState<string>("");

  const handleSubmit = async () => {
    setStatus("");

    try {
      await openCheckout({
        amount,
        name: "MSTOO Booking",
        description: "Service booking payment",
        email: "customer@example.com",
        phone: "+919876543210",
        onSuccess: async (response) => {
          const payload: BookingPaymentPayload = {
            payment_method: "razor_pay",
            zone_id: zoneId,
            service_schedule: serviceSchedule,
            service_address_id: serviceAddressId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          };

          await createBookingWithRazorpay(payload);
          setStatus("Booking created successfully.");
          router.push("/bookings");
        },
        onFailure: (err) => {
          const message = err instanceof Error ? err.message : "Payment failed";
          setStatus(message);
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to start checkout.";
      setStatus(message);
    }
  };

  return (
    <main className="mx-auto max-w-xl space-y-6 p-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Booking checkout</h1>
        <p className="mt-2 text-sm text-slate-600">
          This example calls the Laravel endpoint for booking payment and sends the Razorpay signature back for server verification.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Amount (paise)
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            type="number"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Zone ID
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={zoneId}
            onChange={(event) => setZoneId(event.target.value)}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Service address ID
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={serviceAddressId}
            onChange={(event) => setServiceAddressId(event.target.value)}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Service schedule
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            type="datetime-local"
            value={serviceSchedule}
            onChange={(event) => setServiceSchedule(event.target.value)}
          />
        </label>

        <button
          type="button"
          className="w-full rounded-md bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-400"
          onClick={() => void handleSubmit()}
          disabled={isLoading || !isReady}
        >
          {isLoading ? "Preparing payment..." : isReady ? "Pay securely" : "Loading Razorpay..."}
        </button>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {status ? <p className="text-sm text-slate-700">{status}</p> : null}
      </div>
    </main>
  );
}
