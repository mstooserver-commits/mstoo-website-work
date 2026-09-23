export class ApiError extends Error {
  status: number;
  code?: string;
  payload?: unknown;

  constructor(message: string, status = 500, code?: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

export function extractApiError(payload: unknown, fallback = "Something went wrong") {
  if (!payload || typeof payload !== "object") return fallback;
  const body = payload as Record<string, unknown>;

  const errors = body.errors;
  if (Array.isArray(errors) && errors.length) {
    const first = errors[0] as Record<string, unknown>;
    if (typeof first?.message === "string" && first.message.trim()) return first.message;
  }
  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    const values = Object.values(errors as Record<string, unknown>);
    const first = values[0];
    if (Array.isArray(first) && typeof first[0] === "string") return first[0];
    if (typeof first === "string") return first;
  }

  if (typeof body.message === "string" && body.message.trim()) return body.message;
  return fallback;
}

export function laravelCode(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  return String((payload as { response_code?: string }).response_code || "");
}

export function isLaravelOk(payload: unknown) {
  const code = laravelCode(payload);
  if (!code) return true;
  return code.endsWith("_200") || code === "default_200";
}
