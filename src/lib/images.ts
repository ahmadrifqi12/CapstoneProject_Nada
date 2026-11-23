import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import sharp from "sharp";

export const UPLOAD_ROOT = path.join(process.cwd(), "data", "uploads");
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["jpeg", "png", "webp"]);

/**
 * Memvalidasi isi berkas dari byte-nya (bukan dari nama/tipe kiriman klien), memutar sesuai EXIF,
 * memperkecil maksimal 1600 px, mengubahnya ke WebP, lalu menyimpannya. Mengembalikan URL publik.
 */
export async function saveImage(buffer: Buffer): Promise<string> {
  if (buffer.length > MAX_UPLOAD_BYTES) throw new Error("Ukuran berkas maksimal 8 MB.");
  let format: string | undefined;
  try {
    format = (await sharp(buffer).metadata()).format;
  } catch {
    throw new Error("Berkas bukan gambar yang valid.");
  }
  if (!format || !ALLOWED.has(format)) throw new Error("Gunakan gambar JPG, PNG, atau WebP.");

  const out = await sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const now = new Date();
  const dir = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.webp`;
  await mkdir(path.join(UPLOAD_ROOT, dir), { recursive: true });
  await writeFile(path.join(UPLOAD_ROOT, dir, name), out);
  return `/uploads/${dir}/${name}`;
}
