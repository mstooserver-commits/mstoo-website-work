import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { COOKIES, LOCALIZATION_HEADER, STORAGE_KEYS, ZONE_HEADER } from "@/lib/constants";
import { ApiError, extractApiError } from "@/lib/errors";

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : "";
}

function currentZoneId() {
  const fromCookie = readCookie(COOKIES.zone);
  if (fromCookie) return fromCookie;
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.location);
    if (!raw) return "";
    const parsed = JSON.parse(raw) as { zoneId?: string };
    return parsed.zoneId ?? "";
  } catch {
    return "";
  }
}

export const api = axios.create({
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const raw = config.url ?? "";
  if (!raw.startsWith("http") && !raw.startsWith("/api/proxy")) {
    config.url = `/api/proxy${raw.startsWith("/") ? raw : `/${raw}`}`;
  }
  const zone = currentZoneId();
  if (zone) {
    config.headers[ZONE_HEADER] = zone;
  }
  config.headers[LOCALIZATION_HEADER] = "en";
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data;
    const message = extractApiError(payload, error.message || "Request failed");

    if (status === 401 && typeof window !== "undefined") {
      const { useAuthStore } = await import("@/lib/stores/auth");
      useAuthStore.getState().clearSession();
      const path = window.location.pathname;
      const isAuthPage = ["/login", "/register", "/forgot-password", "/verify-otp"].some((p) =>
        path.startsWith(p),
      );
      if (!isAuthPage) {
        window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
      }
    }

    return Promise.reject(
      new ApiError(
        message,
        status,
        (payload as { response_code?: string } | undefined)?.response_code,
        payload,
      ),
    );
  },
);

export async function apiGet<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig,
) {
  const { data } = await api.get(url, { params, ...config });
  if (data && typeof data === "object" && "content" in data) {
    return (data as { content: T }).content;
  }
  return data as T;
}

export async function apiPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
  const { data } = await api.post(url, body, config);
  return data as T;
}

export async function apiPut<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
  const { data } = await api.put(url, body, config);
  return data as T;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig) {
  const { data } = await api.delete(url, config);
  return data as T;
}

export async function apiUpload<T>(url: string, form: FormData) {
  const { data } = await api.post(url, form);
  return data as T;
}
