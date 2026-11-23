/** Mengambil nilai isian teks dari FormData untuk dikembalikan ke formulir saat terjadi galat
 *  (React 19 mengosongkan kolom formulir setelah action selesai). Kata sandi tidak pernah disertakan. */
export function values(fd: FormData, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = String(fd.get(k) ?? "");
  return out;
}
