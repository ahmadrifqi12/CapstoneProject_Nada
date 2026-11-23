import { headers } from "next/headers";

// Pembatas sederhana di memori (cukup untuk satu instance server).
// Untuk banyak instance, ganti dengan Redis atau tabel database.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function hit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMin: 0 };
  }
  b.count += 1;
  if (b.count > limit) {
    return { ok: false, retryAfterMin: Math.max(1, Math.ceil((b.resetAt - now) / 60000)) };
  }
  return { ok: true, retryAfterMin: 0 };
}

export function reset(key: string) {
  buckets.delete(key);
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

// Bersihkan entri kedaluwarsa agar memori tidak membengkak.
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
}, 10 * 60 * 1000).unref?.();
