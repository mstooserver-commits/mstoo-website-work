const REDIRECT_BASE = "https://mstoo.local";

/** Return a same-origin application path, never an external or protocol-relative URL. */
export function safeRedirectPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  try {
    const parsed = new URL(value, REDIRECT_BASE);
    if (parsed.origin !== REDIRECT_BASE) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
