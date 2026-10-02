export type RazorpayEnvMode = "test" | "live";

export function getCurrentHost(urlOrHost?: string): string {
  if (!urlOrHost) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://preprod.mstoo.co.in";
    urlOrHost = appUrl;
  }

  try {
    return new URL(urlOrHost).hostname.toLowerCase();
  } catch {
    return String(urlOrHost).toLowerCase();
  }
}

export function isPreprodHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return normalized.includes("preprod") || normalized.includes("localhost") || normalized.includes("127.0.0.1") || normalized.includes("test");
}

export function getRazorpayModePreference(urlOrHost?: string): RazorpayEnvMode {
  const mode = process.env.NEXT_PUBLIC_RAZORPAY_MODE?.trim().toLowerCase();
  if (mode === "test" || mode === "live") return mode;

  const host = getCurrentHost(urlOrHost);
  return isPreprodHostname(host) ? "test" : "live";
}

export function resolveRazorpayPublicKey(urlOrHost?: string): string {
  const host = getCurrentHost(urlOrHost);
  const testKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY ?? "";
  const liveKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_LIVE ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY ?? "";
  const mode = getRazorpayModePreference(host);

  if (mode === "test") {
    return testKey || liveKey;
  }

  if (isPreprodHostname(host) && !testKey && liveKey) {
    return liveKey;
  }

  return liveKey || testKey;
}
