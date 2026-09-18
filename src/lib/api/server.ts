import { cookies } from "next/headers";
import { API_BASE_URL, COOKIES, LOCALIZATION_HEADER, ZONE_HEADER } from "@/lib/constants";
import { ApiError, extractApiError } from "@/lib/errors";
import type { LaravelResponse } from "@/types";

type ServerFetchOptions = {
  zoneId?: string;
  token?: string;
  cache?: RequestCache;
  revalidate?: number;
  method?: string;
  body?: unknown;
};

export async function serverFetch<T>(path: string, options: ServerFetchOptions = {}): Promise<T> {
  const jar = cookies();
  const token = options.token ?? jar.get(COOKIES.token)?.value;
  const zoneId = options.zoneId ?? jar.get(COOKIES.zone)?.value ?? "";

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    [LOCALIZATION_HEADER]: "en",
  };
  if (zoneId) headers[ZONE_HEADER] = zoneId;
  if (!zoneId) headers[ZONE_HEADER] = "configuration";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: options.cache ?? (options.revalidate ? undefined : "no-store"),
    next: options.revalidate ? { revalidate: options.revalidate } : undefined,
  });

  let json: LaravelResponse<T> | T | null = null;
  try {
    json = (await res.json()) as LaravelResponse<T>;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new ApiError(
      extractApiError(json, `Request failed (${res.status})`),
      res.status,
      (json as LaravelResponse)?.response_code,
      json,
    );
  }

  if (json && typeof json === "object" && "content" in json) {
    return ((json as LaravelResponse<T>).content ?? json) as T;
  }
  return json as T;
}

export async function serverRaw<T>(path: string, options: ServerFetchOptions = {}) {
  return serverFetch<T>(path, options);
}
