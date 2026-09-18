"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/auth";
import { useCartStore } from "@/lib/stores/cart";
import { servicePriceLabel } from "@/lib/currency";
import { EmptyState } from "@/components/ui/states";

export default function CartPage() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const items = useCartStore((s) => s.items);
  const loading = useCartStore((s) => s.loading);
  const remove = useCartStore((s) => s.remove);
  const updateQty = useCartStore((s) => s.updateQty);

  if (!isLoggedIn) {
    return (
      <div className="container-page py-12">
        <EmptyState
          title="Login to view your cart"
          action={
            <Link href="/login?redirect=/cart" className="btn-primary">
              Login
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">Cart</h1>
      {loading ? <p className="mt-6 text-muted">Loading…</p> : null}
      {items.length === 0 && !loading ? (
        <EmptyState title="Your cart is empty" className="mt-6" action={<Link href="/" className="btn-primary">Browse ads</Link>} />
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-semibold">{item.service?.name || item.variant_key}</p>
                <p className="text-sm text-brand">
                  {item.service ? servicePriceLabel(item.service) : ""} × {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary px-3 py-1" onClick={() => item.id && updateQty(item.id, Math.max(1, (item.quantity || 1) - 1))}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button className="btn-secondary px-3 py-1" onClick={() => item.id && updateQty(item.id, (item.quantity || 1) + 1)}>
                  +
                </button>
                <button
                  className="text-sm text-danger"
                  onClick={async () => {
                    if (!item.id) return;
                    try {
                      await remove(item.id);
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Could not remove");
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <Link href="/checkout" className="btn-primary mt-4 inline-flex">
            Continue to checkout
          </Link>
        </div>
      )}
    </div>
  );
}
