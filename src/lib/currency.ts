import { CURRENCY } from "@/lib/constants";
import type { CartItem } from "@/types";

export function formatInr(amount?: number | string | null, decimals = 0) {
  const n = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  if (!Number.isFinite(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(n);
}

export function servicePriceLabel(service: {
  display_price?: string | null;
  price?: number | string | null;
  min_price?: number | string | null;
  rent_duration?: string | null;
  variations_app_format?: { display_price?: string; price_unit?: string } | null;
}) {
  const display =
    service.display_price?.trim() || service.variations_app_format?.display_price?.trim();
  if (display) return display;
  const price = Number(service.price ?? service.min_price ?? 0);
  const unit =
    service.rent_duration?.replace(/^rent\//, "") || service.variations_app_format?.price_unit;
  return unit ? `${formatInr(price)}/${unit}` : formatInr(price);
}

function positiveNumber(...values: unknown[]) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return 0;
}

export function cartItemUnitPrice(item: CartItem) {
  const service = item.service;
  const variations = [
    ...(service?.variations_app_format?.zone_wise_variations ?? []),
    ...(service?.variations ?? []),
  ];
  const selected = variations.find((variation) => variation.variant_key === item.variant_key);

  return positiveNumber(
    item.service_cost,
    selected?.price,
    service?.variations_app_format?.default_price,
    service?.variations_app_format?.min_price,
    service?.price,
    service?.min_price,
  );
}

export function cartItemLineTotal(item: CartItem) {
  return positiveNumber(item.total_cost) || cartItemUnitPrice(item) * Number(item.quantity ?? 1);
}
