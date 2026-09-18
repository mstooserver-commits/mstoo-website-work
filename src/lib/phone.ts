/** Normalize Indian mobile numbers to E.164 (+91XXXXXXXXXX). */
export function normalizeIndiaPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  if (input.trim().startsWith("+91") && digits.length >= 12) {
    return `+91${digits.slice(-10)}`;
  }
  return input.trim();
}

export function isValidIndiaPhone(input: string): boolean {
  const normalized = normalizeIndiaPhone(input);
  return /^\+91[6-9]\d{9}$/.test(normalized);
}

export function displayPhone(input?: string | null) {
  if (!input) return "";
  const n = normalizeIndiaPhone(input);
  if (n.startsWith("+91") && n.length === 13) {
    return `+91 ${n.slice(3, 8)} ${n.slice(8)}`;
  }
  return input;
}
