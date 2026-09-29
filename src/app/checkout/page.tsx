"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { addressApi, bookingApi, couponApi } from "@/lib/api";
import { ensureRazorpayScript } from "@/lib/api/payment";
import {
  bookingCallbackUrl,
  defaultCheckoutSchedule,
  extractPaymentRedirect,
  extractRazorpayOrder,
  hostedBookingPaymentUrl,
  toLaravelSchedule,
} from "@/lib/booking-payment";
import { cartItemLineTotal, formatInr } from "@/lib/currency";
import { ApiError, extractApiError, isLaravelOk, laravelCode } from "@/lib/errors";
import { useAuthStore } from "@/lib/stores/auth";
import { useCartStore } from "@/lib/stores/cart";
import { useConfigStore } from "@/lib/stores/config";
import { useLocationStore } from "@/lib/stores/location";
import { isFlagOn } from "@/lib/utils";
import { paymentReturnFlag } from "@/lib/wallet-payment";
import type { Address } from "@/types";
import { EmptyState } from "@/components/ui/states";

function unwrapAddresses(payload: unknown): Address[] {
  if (Array.isArray(payload)) return payload as Address[];
  if (!payload || typeof payload !== "object") return [];

  const body = payload as { data?: unknown; addresses?: unknown; content?: unknown };
  for (const nested of [body.data, body.addresses, body.content]) {
    if (Array.isArray(nested)) return nested as Address[];
  }
  for (const nested of [body.data, body.addresses, body.content]) {
    const addresses = unwrapAddresses(nested);
    if (addresses.length > 0) return addresses;
  }
  return [];
}

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const cartLoading = useCartStore((s) => s.loading);
  const loadCart = useCartStore((s) => s.load);
  const empty = useCartStore((s) => s.empty);
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const config = useConfigStore((s) => s.config);
  const location = useLocationStore((s) => s.location);
  const [addressId, setAddressId] = useState("");
  const [schedule, setSchedule] = useState(defaultCheckoutSchedule);
  const [note, setNote] = useState("");
  const [coupon, setCoupon] = useState("");
  const [method, setMethod] = useState("razor_pay");
  const [busy, setBusy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [complete, setComplete] = useState(false);

  const addresses = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressApi.list(),
    enabled: isLoggedIn,
  });
  const list = unwrapAddresses(addresses.data);

  useEffect(() => {
    if (list[0]?.id && !addressId) setAddressId(String(list[0].id));
  }, [list, addressId]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + cartItemLineTotal(item), 0),
    [items],
  );
  const walletBalance = Number(user?.wallet_balance || 0);

  const digital = isFlagOn(config?.digital_payment);
  const wallet = isFlagOn(config?.wallet_payment);
  const cas = isFlagOn(config?.cash_after_service);

  useEffect(() => {
    if (!items.length && !complete) void loadCart();
  }, [complete, items.length, loadCart]);

  useEffect(() => {
    const available = [
      digital && "razor_pay",
      wallet && "wallet_payment",
      cas && "cash_after_service",
    ].filter(Boolean) as string[];
    if (available.length && !available.includes(method)) setMethod(available[0]);
  }, [cas, digital, method, wallet]);

  useEffect(() => {
    const flag = paymentReturnFlag(window.location.search, window.location.pathname);
    if (!flag) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("flag");
    url.searchParams.delete("status");
    url.searchParams.delete("payment");
    window.history.replaceState({}, "", url.pathname + url.search);
    if (flag === "success") {
      setComplete(true);
      toast.success("Booking placed successfully");
      void empty();
      void refreshUser();
    } else {
      toast.error("Payment failed or was cancelled");
    }
  }, [empty, refreshUser]);

  const selectedAddress = list.find((address) => String(address.id) === addressId);
  const zoneId = selectedAddress?.zone_id || location?.zoneId || "";

  const finishSuccess = async () => {
    await empty();
    await refreshUser();
    setComplete(true);
    toast.success("Booking placed successfully");
  };

  const place = async (extra: Record<string, unknown> = {}) => {
    if (!addressId) throw new Error("Add a service address first");
    if (!schedule) throw new Error("Pick a schedule");
    if (!zoneId) throw new Error("Select a service zone before checkout");
    const res = await bookingApi.place({
      payment_method: method,
      service_address_id: addressId,
      service_schedule: toLaravelSchedule(schedule),
      zone_id: zoneId,
      user_id: user?.id,
      note,
      payment_platform: "web",
      ...extra,
    });
    if (!isLaravelOk(res)) {
      throw new ApiError(extractApiError(res, "Booking failed"), 400, laravelCode(res), res);
    }
    await finishSuccess();
  };

  const startHostedRazorpay = () => {
    if (!user?.id) throw new Error("Please log in again");
    const url = hostedBookingPaymentUrl({
      gateway: "razor_pay",
      userId: String(user.id),
      zoneId,
      schedule: toLaravelSchedule(schedule),
      addressId,
      callback: bookingCallbackUrl(),
    });
    toast.message("Redirecting to secure payment…");
    window.location.href = url;
  };

  const payWithRazorpay = async () => {
    try {
      const envelope = await bookingApi.razorpay({});
      if (isLaravelOk(envelope)) {
        const order = extractRazorpayOrder(envelope);
        if (order) {
          await ensureRazorpayScript();
          if (!window.Razorpay) throw new Error("Razorpay checkout could not load");
          const rzp = new window.Razorpay({
            key: order.key,
            amount: order.amount,
            currency: order.currency || "INR",
            name: "MSTOO",
            description: "Service booking",
            order_id: order.order_id,
            prefill: { contact: user?.phone || "", email: user?.email || "" },
            theme: { color: "#D93F46" },
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
            modal: { ondismiss: () => setBusy(false) },
          });
          rzp.on?.("payment.failed", () => {
            toast.error("Payment failed");
            setBusy(false);
          });
          rzp.open();
          return;
        }
        const redirect = extractPaymentRedirect(envelope);
        if (redirect) {
          window.location.href = redirect;
          return;
        }
      }
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 404) {
        /* hosted checkout still available */
      }
    }
    startHostedRazorpay();
  };

  const pay = async () => {
    if (!acceptTerms) {
      toast.error("Please accept Terms & Conditions");
      return;
    }
    if (!addressId) {
      toast.error("Add a service address first");
      return;
    }
    if (!schedule) {
      toast.error("Pick a schedule");
      return;
    }
    if (method === "wallet_payment" && walletBalance < subtotal) {
      toast.error("Insufficient wallet balance");
      return;
    }
    setBusy(true);
    try {
      if (method === "razor_pay") {
        await payWithRazorpay();
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

  if (!isLoggedIn) {
    return (
      <div className="container-page py-12">
        <EmptyState
          title="Login to checkout"
          action={
            <Link href="/login?redirect=/checkout" className="btn-primary">
              Login
            </Link>
          }
        />
      </div>
    );
  }

  if (complete) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold text-brand">Booking placed successfully</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          MSTOO holds the payment securely until the rental is completed. Track status under Bookings.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/bookings" className="btn-primary">
            View bookings
          </Link>
          <Link href="/" className="btn-secondary">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="container-page grid gap-6 py-8 pb-28 lg:grid-cols-3">
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
                  <span className="block text-muted">
                    {a.contact_person_name} {a.contact_person_number}
                  </span>
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
                <input
                  type="radio"
                  checked={method === "wallet_payment"}
                  onChange={() => setMethod("wallet_payment")}
                />
                Wallet ({formatInr(walletBalance)})
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
          <label className="mt-4 flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="font-medium text-brand">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-brand">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </section>
      </div>
      <aside className="card h-fit space-y-3 p-4">
        <h2 className="font-semibold">Summary</h2>
        {items.map((item) => (
          <div key={item.id || item.variant_key} className="flex justify-between gap-3 text-sm">
            <span>
              {item.service?.name || item.variant_key} × {item.quantity ?? 1}
            </span>
            <span>{formatInr(cartItemLineTotal(item))}</span>
          </div>
        ))}
        <p className="border-t border-line pt-3 text-xl font-bold">{formatInr(subtotal)}</p>
        <div className="flex gap-2">
          <input className="input" placeholder="Coupon" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
          <button
            className="btn-secondary"
            type="button"
            onClick={async () => {
              try {
                await couponApi.apply({ coupon_code: coupon });
                toast.success("Coupon applied");
                await loadCart();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Invalid coupon");
              }
            }}
          >
            Apply
          </button>
        </div>
        <button className="btn-primary w-full" disabled={busy || (!digital && !wallet && !cas)} onClick={() => void pay()}>
          {busy ? "Processing…" : method === "razor_pay" ? "Pay & place booking" : "Place booking"}
        </button>
      </aside>
    </div>
  );
}
