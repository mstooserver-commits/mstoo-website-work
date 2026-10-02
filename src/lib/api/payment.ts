import { API_BASE_URL, ENDPOINTS } from "@/lib/constants";
import { resolveRazorpayPublicKey } from "@/lib/razorpay-env";

export type ApiEnvelope<T> = {
  content?: T;
  data?: T;
  message?: string;
  status?: boolean;
  response_code?: string;
};

export type CustomerConfig = {
  razorpay_key?: string;
  razorpay_key_id?: string;
  razorpayKey?: string;
  razorpayKeyId?: string;
  [key: string]: unknown;
};

export type BookingPaymentPayload = {
  payment_method: "razor_pay";
  zone_id: string;
  service_schedule: string;
  service_address_id: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  [key: string]: unknown;
};

export type WalletTopupPayload = {
  amount: number;
  payment_method: "razor_pay";
  callback?: string;
  payment_platform?: string;
  [key: string]: unknown;
};

export type WalletTopupResponse = {
  payment_url?: string;
  url?: string;
  redirect_url?: string;
  data?: {
    payment_url?: string;
    url?: string;
    redirect_url?: string;
  };
  message?: string;
};

export type RazorpaySuccessResponse = {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

export type RazorpayCheckoutOptions = {
  amount: number;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  onSuccess?: (response: RazorpaySuccessResponse) => void | Promise<void>;
  onFailure?: (error: unknown) => void | Promise<void>;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on?: (event: string, callback: (response: unknown) => void) => void;
    };
  }
}

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

type ResponseLike<T> = T | ApiEnvelope<T>;

function normalizeResponse<T>(value: ResponseLike<T>): T {
  if (value && typeof value === "object") {
    if ("content" in value && value.content !== undefined) return value.content as T;
    if ("data" in value && value.data !== undefined) return value.data as T;
  }
  return value as T;
}

function getAuthTokenFromDocument(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("mstoo_token="));
  if (!match) return "";
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

export function getAuthToken(): string {
  if (typeof document !== "undefined") {
    const token = getAuthTokenFromDocument();
    if (token) return token;
  }
  return "";
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (init.body !== undefined && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const rawText = await res.text();
  let json: unknown = null;
  if (rawText) {
    try {
      json = JSON.parse(rawText);
    } catch {
      json = rawText;
    }
  }

  if (!res.ok) {
    const payload = json as ApiEnvelope<unknown> | undefined;
    const message =
      (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string" && payload.message)
        ? payload.message
        : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return normalizeResponse<T>(json as ResponseLike<T>);
}

export async function getConfig(): Promise<CustomerConfig> {
  const payload = await requestJson<CustomerConfig | ApiEnvelope<CustomerConfig>>(ENDPOINTS.config);
  const config = normalizeResponse<CustomerConfig>(payload);

  return {
    ...config,
    razorpay_key:
      config.razorpay_key ??
      config.razorpay_key_id ??
      config.razorpayKey ??
      config.razorpayKeyId ??
      process.env.NEXT_PUBLIC_RAZORPAY_KEY ??
      "",
  };
}

export async function createBookingWithRazorpay(payload: BookingPaymentPayload) {
  return requestJson(ENDPOINTS.bookingPlace, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function addWalletFund(amount: number, extra: Partial<WalletTopupPayload> = {}): Promise<string> {
  const body: WalletTopupPayload = {
    amount,
    payment_method: "razor_pay",
    payment_platform: "web",
    ...extra,
  };

  const result = await requestJson<WalletTopupResponse>(ENDPOINTS.walletAddFund, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const paymentUrl =
    result.payment_url ??
    result.url ??
    result.redirect_url ??
    result.data?.payment_url ??
    result.data?.url ??
    result.data?.redirect_url;

  if (!paymentUrl) {
    throw new Error(result.message ?? "Wallet funding response did not include a payment URL.");
  }

  return paymentUrl;
}

export async function ensureRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Razorpay checkout is only available in the browser.");
  }

  if (window.Razorpay) return;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script."));
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout({
  amount,
  name,
  description,
  email,
  phone,
  onSuccess,
  onFailure,
}: RazorpayCheckoutOptions): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Razorpay checkout is only available in the browser.");
  }

  const config = await getConfig();
  const publicKey =
    resolveRazorpayPublicKey(typeof window !== "undefined" ? window.location.href : process.env.NEXT_PUBLIC_APP_URL) ||
    config.razorpay_key ||
    config.razorpay_key_id ||
    config.razorpayKey ||
    config.razorpayKeyId ||
    "";

  if (!publicKey.trim()) {
    throw new Error("Razorpay public key is missing. Set NEXT_PUBLIC_RAZORPAY_KEY or fetch it from /api/v1/customer/config.");
  }

  await ensureRazorpayScript();

  const payload = { 
    key: publicKey,
    amount: Math.max(100, Math.round(amount)),
    currency: "INR",
    name,
    description: description ?? "Secure payment",
    handler: async (response: RazorpaySuccessResponse) => {
      if (onSuccess) await onSuccess(response);
    },
    prefill: {
      email: email ?? "",
      contact: phone ?? "",
    },
    notes: {
      email: email ?? "",
      phone: phone ?? "",
    },
    theme: { color: "#d72638" },
    modal: {
      ondismiss: async () => {
        if (onFailure) await onFailure(new Error("Razorpay payment was cancelled."));
      },
    },
  };

  if (!window.Razorpay) {
    throw new Error("Razorpay checkout script is not available yet.");
  }

  const razorpay = new window.Razorpay(payload as Record<string, unknown>);
  razorpay.on?.("payment.failed", async (response: unknown) => {
    if (onFailure) await onFailure(response);
  });
  razorpay.open();
}
