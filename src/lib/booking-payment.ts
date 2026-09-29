import { API_BASE_URL } from "@/lib/constants";
import { extractPaymentRedirect, extractRazorpayOrder } from "@/lib/wallet-payment";

export { extractPaymentRedirect, extractRazorpayOrder };

export function toLaravelSchedule(value: string) {
  if (!value) return "";
  if (value.length === 16) return `${value.replace("T", " ")}:00`;
  return value.replace("T", " ").slice(0, 19);
}

export function defaultCheckoutSchedule() {
  const date = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function base64Url(value: string) {
  const bytes = typeof btoa === "function" ? btoa(unescape(encodeURIComponent(value))) : value;
  return bytes.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function hostedBookingPaymentUrl(input: {
  gateway: string;
  userId: string;
  zoneId: string;
  schedule: string;
  addressId: string;
  callback: string;
}) {
  const gateway = input.gateway.replaceAll("_", "-");
  const query = new URLSearchParams({
    access_token: base64Url(input.userId),
    zone_id: input.zoneId,
    service_schedule: input.schedule,
    service_address_id: input.addressId,
    callback: input.callback,
  });
  return `${API_BASE_URL}/payment/${gateway}/pay?${query.toString()}`;
}

export function bookingCallbackUrl() {
  if (typeof window === "undefined") return "/checkout";
  return `${window.location.origin}/checkout`;
}
