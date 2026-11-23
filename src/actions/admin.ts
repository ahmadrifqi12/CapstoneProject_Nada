"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { db } from "@/lib/db";
import { assertAdmin } from "@/lib/auth";
import { slugify, stripHtml, truncate } from "@/lib/format";
import { uniqueSlug } from "@/lib/catalog";
import { SIZES, ORDER_STATUSES } from "@/lib/constants";
import { cancelOrder } from "@/lib/orders";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/settings";
import type { FormState } from "./auth";

const imageUrl = z.string().regex(/^\/uploads\/[\w\-./]+$/, "Alamat gambar tidak valid.");

// ─────────────────────────── Produk ───────────────────────────

const productSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().trim().min(2, "Isi nama produk.").max(120),
  category: z.string().trim().min(1, "Pilih kategori.").max(40),
  price: z.number().int("Harga harus bilangan bulat.").min(1000, "Harga minimal Rp1.000.").max(100_000_000),
  description: z.string().trim().max(5000),
  material: z.string().trim().max(500),
  featured: z.boolean(),
  storyIds: z.array(z.number().int()).max(50),
  colors: z
    .array(
      z.object({
        id: z.number().int().optional(),
        name: z.string().trim().min(1, "Setiap warna perlu nama.").max(40),
        hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Kode warna harus berbentuk #RRGGBB."),
        images: z.array(imageUrl).max(10),
        stocks: z.record(z.string(), z.number().int().min(0).max(99999).nullable()),
      }),
    )
    .max(20),
});

export type ProductPayload = z.input<typeof productSchema>;

export async function saveProduct(payload: unknown, status: "DRAFT" | "ACTIVE"): Promise<FormState> {
  await assertAdmin();
  const parsed = productSchema.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const p = parsed.data;

  const names = p.colors.map((c) => c.name.toLowerCase());
  if (new Set(names).size !== names.length) return { error: "Nama warna tidak boleh kembar." };

  if (status === "ACTIVE") {
    if (p.colors.length === 0) return { error: "Tambahkan minimal satu warna sebelum mengaktifkan produk." };
    for (const c of p.colors) {
      if (c.images.length === 0) return { error: `Warna "${c.name}" belum punya foto.` };
      if (!SIZES.some((s) => typeof c.stocks[s] === "number")) {
        return { error: `Warna "${c.name}" belum punya ukuran dan stok.` };
      }
    }
  }

  const slug = await uniqueSlug("product", slugify(p.name), p.id);

  const saved = await db.$transaction(async (tx) => {
    const base = {
      name: p.name,
      slug,
      category: p.category,
      price: p.price,
      description: p.description,
      material: p.material,
      featured: p.featured,
      status,
    };
    const product = p.id
      ? await tx.product.update({ where: { id: p.id }, data: base })
      : await tx.product.create({ data: base });

    // Warna yang dihapus di formulir ikut dihapus (varian dan fotonya ikut terhapus; riwayat pesanan tetap aman
    // karena order_items menyimpan salinan nama, harga, dan foto).
    const keep = p.colors.filter((c) => c.id).map((c) => c.id!);
    await tx.productColor.deleteMany({ where: { productId: product.id, id: { notIn: keep } } });
    const owned = new Set(
      (await tx.productColor.findMany({ where: { productId: product.id }, select: { id: true } })).map((c) => c.id),
    );

    for (const [pos, c] of p.colors.entries()) {
      let colorId: number;
      if (c.id && owned.has(c.id)) {
        await tx.productColor.update({ where: { id: c.id }, data: { name: c.name, hex: c.hex, position: pos } });
        colorId = c.id;
        await tx.productImage.deleteMany({ where: { colorId } });
      } else {
        colorId = (
          await tx.productColor.create({
            data: { productId: product.id, name: c.name, hex: c.hex, position: pos },
          })
        ).id;
      }
      if (c.images.length) {
        await tx.productImage.createMany({
          data: c.images.map((url, i) => ({ colorId, url, position: i })),
        });
      }
      for (const size of SIZES) {
        const stock = c.stocks[size];
        if (typeof stock === "number") {
          await tx.productVariant.upsert({
            where: { colorId_size: { colorId, size } },
            create: { colorId, size, stock },
            update: { stock },
          });
        } else {
          await tx.productVariant.deleteMany({ where: { colorId, size } });
        }
      }
    }

    await tx.product.update({
      where: { id: product.id },
      data: { stories: { set: p.storyIds.map((id) => ({ id })) } },
    });
    return product;
  });

  redirect(`/admin/produk?disimpan=${saved.id}`);
}

export async function setProductStatus(id: number, status: "DRAFT" | "ACTIVE" | "ARCHIVED") {
  await assertAdmin();
  await db.product.update({ where: { id }, data: { status } });
  redirect("/admin/produk");
}

export async function duplicateProduct(id: number) {
  await assertAdmin();
  const src = await db.product.findUnique({
    where: { id },
    include: {
      stories: { select: { id: true } },
      colors: { orderBy: { position: "asc" }, include: { images: { orderBy: { position: "asc" } }, variants: true } },
    },
  });
  if (!src) redirect("/admin/produk");
  const name = `${src.name} (Salinan)`;
  const slug = await uniqueSlug("product", slugify(name));
  const copy = await db.product.create({
    data: {
      name,
      slug,
      description: src.description,
      material: src.material,
      category: src.category,
      price: src.price,
      status: "DRAFT",
      featured: false,
      stories: { connect: src.stories },
      colors: {
        create: src.colors.map((c) => ({
          name: c.name,
          hex: c.hex,
          position: c.position,
          images: { create: c.images.map((i) => ({ url: i.url, position: i.position })) },
          variants: { create: c.variants.map((v) => ({ size: v.size, stock: v.stock })) },
        })),
      },
    },
  });
  redirect(`/admin/produk/${copy.id}`);
}

// ─────────────────────────── Kisah ───────────────────────────

function cleanStoryHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ["h2", "h3", "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote", "a", "img", "hr"],
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
      div: "p",
      b: "strong",
      i: "em",
    },
    exclusiveFilter: (f) => f.tag === "img" && !/^\/uploads\/[\w\-./]+$/.test(f.attribs.src ?? ""),
  });
}

export async function saveStory(_: FormState, fd: FormData): Promise<FormState> {
  await assertAdmin();
  const id = Number(fd.get("id")) || undefined;
  const title = String(fd.get("title") ?? "").trim();
  if (title.length < 3) return { error: "Judul kisah minimal 3 karakter." };
  const cover = String(fd.get("cover") ?? "");
  if (cover && !imageUrl.safeParse(cover).success) return { error: "Gambar sampul tidak valid." };
  const body = cleanStoryHtml(String(fd.get("body") ?? ""));
  const intent = String(fd.get("intent")) === "publish" ? "publish" : "draft";
  if (intent === "publish" && stripHtml(body).length < 20) {
    return { error: "Isi kisah masih terlalu pendek untuk diterbitkan." };
  }
  const excerptIn = String(fd.get("excerpt") ?? "").trim();
  const excerpt = excerptIn || truncate(stripHtml(body), 160);
  const productIds = fd.getAll("productIds").map(Number).filter(Number.isInteger);

  const existing = id ? await db.story.findUnique({ where: { id } }) : null;
  const slug = await uniqueSlug("story", slugify(String(fd.get("slug") || title)), id);

  const data = {
    title,
    slug,
    cover,
    excerpt,
    body,
    status: intent === "publish" ? "PUBLISHED" : "DRAFT",
    // Tanggal terbit diisi saat pertama kali diterbitkan dan tidak berubah pada penyuntingan berikutnya.
    publishedAt: intent === "publish" ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null),
  };
  const related = productIds.map((i) => ({ id: i }));
  if (id) await db.story.update({ where: { id }, data: { ...data, products: { set: related } } });
  else await db.story.create({ data: { ...data, products: { connect: related } } });
  redirect("/admin/kisah?disimpan=1");
}

export async function unpublishStory(id: number) {
  await assertAdmin();
  await db.story.update({ where: { id }, data: { status: "DRAFT" } });
  redirect("/admin/kisah");
}

export async function deleteStory(id: number) {
  await assertAdmin();
  await db.story.delete({ where: { id } });
  redirect("/admin/kisah");
}

// ─────────────────────────── Pesanan ───────────────────────────

export async function updateOrder(code: string, _: FormState, fd: FormData): Promise<FormState> {
  await assertAdmin();
  const status = String(fd.get("status"));
  const tracking = String(fd.get("trackingNumber") ?? "").trim().slice(0, 60);
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return { error: "Status tidak valid." };

  const order = await db.order.findUnique({ where: { code } });
  if (!order) return { error: "Pesanan tidak ditemukan." };
  if (order.status === "CANCELLED") return { error: "Pesanan yang dibatalkan tidak dapat diubah lagi." };
  if (status === "SHIPPED" && !tracking) return { error: "Isi nomor resi sebelum menandai Dikirim." };

  if (status === "CANCELLED") {
    await cancelOrder(order.id);
  } else {
    await db.order.update({ where: { id: order.id }, data: { status, trackingNumber: tracking } });
  }
  if (status === "CANCELLED" && tracking !== order.trackingNumber) {
    await db.order.update({ where: { id: order.id }, data: { trackingNumber: tracking } });
  }
  revalidatePath("/admin", "layout");
  return { ok: "Pesanan diperbarui." };
}

// ─────────────────────────── Pesan Contact ───────────────────────────

export async function setMessageRead(id: number, read: boolean) {
  await assertAdmin();
  await db.message.update({ where: { id }, data: { read } });
  redirect("/admin/pesan");
}

export async function deleteMessage(id: number) {
  await assertAdmin();
  await db.message.delete({ where: { id } });
  redirect("/admin/pesan");
}

// ─────────────────────────── Pengaturan situs ───────────────────────────

const httpUrl = z.string().trim().url("Tautan harus diawali https://").refine((u) => /^https?:\/\//.test(u), "Tautan harus diawali http:// atau https://");

export async function saveSettings(_: FormState, fd: FormData): Promise<FormState> {
  await assertAdmin();
  const str = (k: string, max = 500) => String(fd.get(k) ?? "").trim().slice(0, max);

  const platforms = fd.getAll("social_platform").map(String);
  const handles = fd.getAll("social_handle").map(String);
  const urls = fd.getAll("social_url").map(String);
  const socials: SiteSettings["socials"] = [];
  for (let i = 0; i < platforms.length; i++) {
    if (!urls[i]?.trim() && !handles[i]?.trim()) continue; // baris kosong diabaikan
    const u = httpUrl.safeParse(urls[i]);
    if (!u.success) return { error: `Tautan media sosial "${handles[i] || platforms[i]}": ${u.error.issues[0].message}` };
    socials.push({ platform: platforms[i].slice(0, 20), handle: handles[i].trim().slice(0, 60), url: u.data });
  }

  const hero = str("heroImage");
  if (hero && !imageUrl.safeParse(hero).success) return { error: "Gambar hero tidak valid." };
  const email = str("contactEmail", 120);
  if (email && !z.string().email().safeParse(email).success) return { error: "Email kontak tidak valid." };

  const next: SiteSettings = {
    ...DEFAULT_SETTINGS,
    siteName: DEFAULT_SETTINGS.siteName,
    tagline: str("tagline", 160),
    heroTitle: str("heroTitle", 120),
    heroSubtitle: str("heroSubtitle", 300),
    heroImage: hero,
    heroCta: str("heroCta", 40) || DEFAULT_SETTINGS.heroCta,
    contactEmail: email,
    contactPhone: str("contactPhone", 40),
    whatsapp: str("whatsapp", 20).replace(/\D/g, ""),
    address: str("address", 300),
    hours: str("hours", 120),
    socials,
    shippingFee: Math.max(0, Math.round(Number(fd.get("shippingFee")) || 0)),
    freeShippingMin: Math.max(0, Math.round(Number(fd.get("freeShippingMin")) || 0)),
    bankInfo: str("bankInfo", 400),
  };
  await db.siteSetting.upsert({
    where: { key: "main" },
    create: { key: "main", value: JSON.stringify(next) },
    update: { value: JSON.stringify(next) },
  });
  revalidatePath("/", "layout");
  return { ok: "Pengaturan disimpan." };
}
