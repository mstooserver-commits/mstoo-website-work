"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { addressApi, bookingApi, couponApi } from "@/lib/api";
import { formatInr } from "@/lib/currency";
import { useAuthStore } from "@/lib/stores/auth";
import { useCartStore } from "@/lib/stores/cart";
import { useConfigStore } from "@/lib/stores/config";
import { isFlagOn } from "@/lib/utils";
import type { Address, Paginated } from "@/types";
import { EmptyState } from "@/components/ui/states";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function unwrapAddresses(payload: unknown): Address[] {
  if (Array.isArray(payload)) return payload as Address[];
  return ((payload as Paginated<Address>)?.data || []) as Address[];
}

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const empty = useCartStore((s) => s.empty);
  const user = useAuthStore((s) => s.user);
  const config = useConfigStore((s) => s.config);
  const [addressId, setAddressId] = useState("");
  const [schedule, setSchedule] = useState("");
  const [note, setNote] = useState("");
  const [coupon, setCoupon] = useState("");
  const [method, setMethod] = useState("razor_pay");
  const [busy, setBusy] = useState(false);

  const addresses = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressApi.list(),
  });
  const list = unwrapAddresses(addresses.data);

  useEffect(() => {
    if (list[0]?.id && !addressId) setAddressId(String(list[0].id));
  }, [list, addressId]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.total_cost ?? item.service_cost ?? 0) * Number(item.quantity ?? 1), 0),
    [items],
  );

  const digital = isFlagOn(config?.digital_payment);
  const wallet = isFlagOn(config?.wallet_payment);
  const cas = isFlagOn(config?.cash_after_service);

  const place = async (extra: Record<string, unknown> = {}) => {
    if (!addressId) {
      toast.error("Add a service address first");
      return;
    }
    if (!schedule) {
      toast.error("Pick a schedule");
      return;
    }
    const body = {
      payment_method: method,
      service_address_id: addressId,
      schedule,
      user_id: user?.id,
      note,
      ...extra,
    };
    if (method === "razor_pay") {
      await bookingApi.razorpay(body);
    } else {
      await bookingApi.place(body);
    }
    await empty();
    toast.success("Booking placed");
    window.location.href = "/bookings";
  };

  const pay = async () => {
    setBusy(true);
    try {
      if (method === "razor_pay") {
        const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || config?.razorpay_key || config?.razorpayKey;
        const amount = Math.max(100, Math.round(subtotal * 100));
        let orderId: string | undefined;
        try {
          const orderRes = await fetch("/api/razorpay/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, currency: "INR" }),
          });
          if (orderRes.ok) {
            const order = await orderRes.json();
            orderId = order.id;
          }
        } catch {
          /* fallback to key-only checkout */
        }
        if (!key || !window.Razorpay) {
          toast.error("Razorpay is not configured. You can still use other enabled methods.");
          setBusy(false);
          return;
        }
        const rzp = new window.Razorpay({
          key,
          amount,
          currency: "INR",
          name: "MSTOO",
          order_id: orderId,
          handler: async (response: { razorpay_payment_id?: string; razorpay_order_id?: string; razorpay_signature?: string }) => {
            try {
              await place({
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature,
              });
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Booking failed after payment");
            }
          },
        });
        rzp.open();
        setBusy(false);
        return;
      }
      await place();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-12">
        <EmptyState title="Cart is empty" action={<Link href="/cart" className="btn-primary">Go to cart</Link>} />
      </div>
    );
  }

  return (
    <div className="container-page grid gap-6 py-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <section className="card p-4">
          <h2 className="font-semibold">Schedule</h2>
          <input type="datetime-local" className="input mt-3" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
          <textarea className="input mt-3" placeholder="Note for provider" value={note} onChange={(e) => setNote(e.target.value)} />
        </section>
        <section className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Address</h2>
            <Link href="/address" className="text-sm text-brand">
              Manage
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {list.map((a) => (
              <label key={String(a.id)} className="flex items-start gap-2 text-sm">
                <input type="radio" name="address" checked={addressId === String(a.id)} onChange={() => setAddressId(String(a.id))} />
                <span>
                  {a.address}
                  <span className="block text-muted">{a.contact_person_name}</span>
                </span>
              </label>
            ))}
            {list.length === 0 ? <p className="text-sm text-muted">No addresses yet.</p> : null}
          </div>
        </section>
        <section className="card p-4">
          <h2 className="font-semibold">Payment</h2>
          <div className="mt-3 space-y-2 text-sm">
            {digital ? (
              <label className="flex items-center gap-2">
                <input type="radio" checked={method === "razor_pay"} onChange={() => setMethod("razor_pay")} />
                Razorpay (UPI / cards / netbanking)
              </label>
            ) : null}
            {wallet ? (
              <label className="flex items-center gap-2">
                <input type="radio" checked={method === "wallet_payment"} onChange={() => setMethod("wallet_payment")} />
                Wallet
              </label>
            ) : null}
            {cas ? (
              <label className="flex items-center gap-2">
                <input type="radio" checked={method === "cash_after_service"} onChange={() => setMethod("cash_after_service")} />
                Cash after service
              </label>
            ) : null}
          </div>
        </section>
      </div>
      <aside className="card h-fit p-4">
        <h2 className="font-semibold">Summary</h2>
        <p className="mt-3 text-sm">{items.length} item(s)</p>
        <p className="mt-2 text-xl font-bold">{formatInr(subtotal)}</p>
        <div className="mt-4 flex gap-2">
          <input className="input" placeholder="Coupon" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
          <button
            className="btn-secondary"
            onClick={async () => {
              try {
                await couponApi.apply({ coupon_code: coupon });
                toast.success("Coupon applied");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Invalid coupon");
              }
            }}
          >
            Apply
          </button>
        </div>
        <button className="btn-primary mt-4 w-full" disabled={busy} onClick={pay}>
          {busy ? "Processing…" : "Place booking"}
        </button>
      </aside>
    </div>
  );
}
