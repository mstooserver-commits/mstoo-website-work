import { API_BASE_URL } from "@/lib/constants";
import type { Paginated, WalletTx } from "@/types";

export type WalletOverview = {
  wallet_balance?: number | string;
  transactions?: Paginated<WalletTx>;
};

export type RazorpayOrder = {
  key: string;
  order_id: string;
  amount: number;
  currency?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function looksLikeUrl(value: unknown): value is string {
  return typeof value === "string" && /^(https?:\/\/|\/)/i.test(value.trim());
}

function absoluteUrl(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${API_BASE_URL}${trimmed}`;
  return "";
}

export function extractPaymentRedirect(payload: unknown): string {
  if (looksLikeUrl(payload)) return absoluteUrl(payload);
  const body = asRecord(payload);
  if (!body) return "";
  if (looksLikeUrl(body.content)) return absoluteUrl(String(body.content));

  const bags = [asRecord(body.content), asRecord(body.data), body].filter(Boolean) as Record<
    string,
    unknown
  >[];
  for (const bag of bags) {
    for (const key of [
      "redirect_url",
      "redirect_link",
      "gateway_redirect_url",
      "payment_url",
      "url",
      "link",
    ]) {
      if (looksLikeUrl(bag[key])) return absoluteUrl(String(bag[key]));
    }
  }
  return "";
}

export function extractRazorpayOrder(payload: unknown): RazorpayOrder | null {
  const body = asRecord(payload);
  const content = asRecord(body?.content) ?? asRecord(body?.data) ?? body;
  if (!content) return null;
  const orderId = content.order_id ?? content.orderId;
  const key = content.key ?? content.razorpay_key ?? content.razorpayKey;
  const amount = Number(content.amount);
  if (!orderId || !key) return null;
  return {
    key: String(key),
    order_id: String(orderId),
    amount: Number.isFinite(amount) ? amount : 0,
    currency: content.currency ? String(content.currency) : "INR",
  };
}

export function unwrapWallet(payload: unknown): { balance: number; items: WalletTx[] } {
  const content = asRecord(payload);
  const nested = asRecord(content?.transactions);
  const items = (
    (Array.isArray(nested?.data) ? nested.data : Array.isArray(content?.data) ? content.data : []) as WalletTx[]
  );
  const balance = Number(content?.wallet_balance ?? 0);
  return { balance: Number.isFinite(balance) ? balance : 0, items };
}

export function paymentReturnFlag(search: string, pathname: string) {
  const params = new URLSearchParams(search);
  const raw = (
    params.get("flag") ||
    params.get("status") ||
    params.get("payment") ||
    pathname.split("/").pop() ||
    ""
  ).toLowerCase();
  if (raw.includes("success") || raw === "complete") return "success" as const;
  if (raw.includes("fail") || raw.includes("cancel")) return "failed" as const;
  return null;
}

export function walletCallbackUrl() {
  if (typeof window === "undefined") return "/wallet";
  return `${window.location.origin}/wallet`;
}
