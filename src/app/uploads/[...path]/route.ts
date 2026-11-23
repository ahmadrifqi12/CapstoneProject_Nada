import path from "node:path";
import { readFile } from "node:fs/promises";
import { UPLOAD_ROOT } from "@/lib/images";

const TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

// Gambar unggahan disajikan lewat rute ini (bukan folder public) agar berkas yang diunggah
// saat aplikasi berjalan di mode produksi langsung dapat diakses.
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  const file = path.resolve(UPLOAD_ROOT, ...parts);
  if (!file.startsWith(UPLOAD_ROOT + path.sep)) return new Response("Not found", { status: 404 });
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(file);
    const seed = parts[0] === "seed";
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
        "Cache-Control": seed ? "public, max-age=3600" : "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
