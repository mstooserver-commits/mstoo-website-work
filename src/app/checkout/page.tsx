"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { addressApi, bookingApi, couponApi } from "@/lib/api";
import { cartItemLineTotal, formatInr } from "@/lib/currency";
import { useAuthStore } from "@/lib/stores/auth";
import { useCartStore } from "@/lib/stores/cart";
import { useConfigStore } from "@/lib/stores/config";
import { useLocationStore } from "@/lib/stores/location";
import { isFlagOn } from "@/lib/utils";
import type { Address, Paginated } from "@/types";
import { EmptyState } from "@/components/ui/states";
import Link from "next/link";

function unwrapAddresses(payload: unknown): Address[] {
  if (Array.isArray(payload)) return payload as Address[];
  return ((payload as Paginated<Address>)?.data || []) as Address[];
}

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const cartLoading = useCartStore((s) => s.loading);
  const loadCart = useCartStore((s) => s.load);
  const empty = useCartStore((s) => s.empty);
  const user = useAuthStore((s) => s.user);
  const config = useConfigStore((s) => s.config);
  const location = useLocationStore((s) => s.location);
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
    () => items.reduce((sum, item) => sum + cartItemLineTotal(item), 0),
    [items],
  );

  const digital = isFlagOn(config?.digital_payment);
  const wallet = isFlagOn(config?.wallet_payment);
  const cas = isFlagOn(config?.cash_after_service);

  useEffect(() => {
    if (!items.length) void loadCart();
  }, [items.length, loadCart]);

  useEffect(() => {
    const available = [
      digital && "razor_pay",
      wallet && "wallet_payment",
      cas && "cash_after_service",
    ].filter(Boolean) as string[];
    if (available.length && !available.includes(method)) setMethod(available[0]);
  }, [cas, digital, method, wallet]);

  const place = async (extra: Record<string, unknown> = {}) => {
    if (!addressId) {
      toast.error("Add a service address first");
      return;
    }
    if (!schedule) {
      toast.error("Pick a schedule");
      return;
    }
    const zoneId =
      list.find((address) => String(address.id) === addressId)?.zone_id || location?.zoneId;
    if (!zoneId) {
      toast.error("Select a service zone before checkout");
      return;
    }
    const serviceSchedule = schedule.length === 16 ? `${schedule.replace("T", " ")}:00` : schedule;
    const body = {
      payment_method: method,
      service_address_id: addressId,
      service_schedule: serviceSchedule,
      zone_id: zoneId,
      user_id: user?.id,
      note,
      ...extra,
    };
    await bookingApi.place(body);
    await empty();
    toast.success("Booking placed");
    window.location.href = "/bookings";
  };

  const pay = async () => {
    setBusy(true);
    try {
      if (method === "razor_pay") {
        const envelope = (await bookingApi.razorpay({})) as {
          content?: { key?: string; order_id?: string; amount?: number; currency?: string };
          message?: string;
        };
        const order = envelope.content;
        if (!order?.order_id || !order.key || !order.amount) {
          throw new Error(envelope.message || "Unable to create a secure payment order");
        }
        if (!window.Razorpay) {
          toast.error("Razorpay checkout could not load. Try again or use another payment method.");
          return;
        }
        const rzp = new window.Razorpay({
          key: order.key,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "MSTOO",
          order_id: order.order_id,
          handler: async (response: {
            razorpay_payment_id?: string;
            razorpay_order_id?: string;
            razorpay_signature?: string;
          }) => {
            try {
              setBusy(true);
              await place({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id || order.order_id,
                razorpay_signature: response.razorpay_signature,
              });
            } catch (err) {
              toast.error(
                err instanceof Error
                  ? `${err.message}. Payment id: ${response.razorpay_payment_id || "unknown"}`
                  : "Booking failed after payment",
              );
            } finally {
              setBusy(false);
            }
          },
          modal: {
            ondismiss: () => setBusy(false),
          },
        });
        rzp.on?.("payment.failed", () => {
          toast.error("Payment failed");
          setBusy(false);
        });
        rzp.open();
        return;
      }
      await place();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setBusy(false);
    } finally {
      if (method !== "razor_pay") setBusy(false);
    }
  };

  if (cartLoading && items.length === 0) {
    return <div className="container-page py-12 text-muted">Loading cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-12">
        <EmptyState
          title="Cart is empty"
          action={
            <Link href="/cart" className="btn-primary">
              Go to cart
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page grid gap-6 py-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <section className="card p-4">
          <h2 className="font-semibold">Schedule</h2>
          <input
            type="datetime-local"
            className="input mt-3"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          />
          <textarea
            className="input mt-3"
            placeholder="Note for provider"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
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
                <input
                  type="radio"
                  name="address"
                  checked={addressId === String(a.id)}
                  onChange={() => setAddressId(String(a.id))}
                />
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
                <input
                  type="radio"
                  checked={method === "razor_pay"}
                  onChange={() => setMethod("razor_pay")}
                />
                Razorpay (UPI / cards / netbanking)
              </label>
            ) : null}
            {wallet ? (
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={method === "wallet_payment"}
                  onChange={() => setMethod("wallet_payment")}
                />
                Wallet
              </label>
            ) : null}
            {cas ? (
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={method === "cash_after_service"}
                  onChange={() => setMethod("cash_after_service")}
                />
                Cash after service
              </label>
            ) : null}
            {!digital && !wallet && !cas ? (
              <p className="text-danger">No payment method is currently available.</p>
            ) : null}
          </div>
        </section>
      </div>
      <aside className="card h-fit p-4">
        <h2 className="font-semibold">Summary</h2>
        <p className="mt-3 text-sm">{items.length} item(s)</p>
        <p className="mt-2 text-xl font-bold">{formatInr(subtotal)}</p>
        <div className="mt-4 flex gap-2">
          <input
            className="input"
            placeholder="Coupon"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
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
        <button
          className="btn-primary mt-4 w-full"
          disabled={busy || (!digital && !wallet && !cas)}
          onClick={pay}
        >
          {busy ? "Processing…" : "Place booking"}
        </button>
      </aside>
    </div>
  );
}
