"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getSettings, shippingFor } from "@/lib/settings";
import { newOrderCode, cancelOrder } from "@/lib/orders";
import { createSnapPayment, midtransEnabled } from "@/lib/midtrans";
import { clientIp, hit } from "@/lib/ratelimit";
import { values } from "@/lib/form";
import type { FormState } from "./auth";

const orderSchema = z.object({
  recipient: z.string().trim().min(2, "Isi nama penerima.").max(80),
  phone: z.string().trim().regex(/^[0-9+\-\s]{8,20}$/, "Nomor telepon tidak valid."),
  address: z.string().trim().min(10, "Alamat terlalu singkat. Tulis jalan, nomor, dan kecamatan.").max(300),
  city: z.string().trim().min(2, "Isi kota/kabupaten.").max(80),
  postalCode: z.string().trim().regex(/^[0-9]{5}$/, "Kode pos harus 5 digit."),
  items: z
    .array(z.object({ variantId: z.number().int().positive(), qty: z.number().int().min(1).max(99) }))
    .min(1, "Keranjang kosong.")
    .max(50),
});

class StockError extends Error {}

export async function placeOrder(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser("/checkout");

  let items: unknown;
  try {
    items = JSON.parse(String(fd.get("items") ?? "[]"));
  } catch {
    return { error: "Isi keranjang tidak valid." };
  }
  const parsed = orderSchema.safeParse({
    recipient: fd.get("recipient"),
    phone: fd.get("phone"),
    address: fd.get("address"),
    city: fd.get("city"),
    postalCode: fd.get("postalCode"),
    items,
  });
  const keep = values(fd, ["recipient", "phone", "address", "city", "postalCode"]);
  if (!parsed.success) return { error: parsed.error.issues[0].message, values: keep };
  const data = parsed.data;

  // Gabungkan baris yang varian-nya sama.
  const merged = new Map<number, number>();
  for (const it of data.items) merged.set(it.variantId, Math.min(99, (merged.get(it.variantId) ?? 0) + it.qty));

  const settings = await getSettings();

  try {
    const order = await db.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { id: { in: [...merged.keys()] } },
        include: { color: { include: { product: true, images: { orderBy: { position: "asc" }, take: 1 } } } },
      });
      if (variants.length !== merged.size) throw new StockError("Ada produk di keranjang yang sudah tidak tersedia.");

      let subtotal = 0;
      const lines = [];
      for (const v of variants) {
        const qty = merged.get(v.id)!;
        const label = `${v.color.product.name} (${v.color.name}, ${v.size})`;
        if (v.color.product.status !== "ACTIVE") throw new StockError(`${label} sudah tidak dijual.`);
        // Pengurangan stok atomik: hanya berhasil bila stok masih cukup saat ini juga.
        const res = await tx.productVariant.updateMany({
          where: { id: v.id, stock: { gte: qty } },
          data: { stock: { decrement: qty } },
        });
        if (res.count !== 1) throw new StockError(`Stok ${label} tidak mencukupi. Kurangi jumlah atau pilih varian lain.`);
        subtotal += v.color.product.price * qty;
        lines.push({
          variantId: v.id,
          productName: v.color.product.name,
          colorName: v.color.name,
          size: v.size,
          image: v.color.images[0]?.url ?? "",
          price: v.color.product.price,
          qty,
        });
      }
      const shippingFee = shippingFor(settings, subtotal);
      return tx.order.create({
        data: {
          code: newOrderCode(),
          userId: user.id,
          recipient: data.recipient,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          subtotal,
          shippingFee,
          total: subtotal + shippingFee,
          items: { create: lines },
        },
      });
    });
    redirect(`/akun/pesanan/${order.code}?baru=1`);
  } catch (e) {
    if (e instanceof StockError) return { error: e.message, values: keep };
    throw e; // termasuk redirect()
  }
}

export async function startPayment(code: string): Promise<FormState> {
  const user = await requireUser(`/akun/pesanan/${code}`);
  const order = await db.order.findFirst({ where: { code, userId: user.id } });
  if (!order || order.status !== "PENDING") return { error: "Pesanan tidak dapat dibayar." };
  if (!midtransEnabled()) return { error: "Pembayaran online belum diaktifkan." };

  let url = order.paymentUrl;
  if (!url) {
    try {
      url = await createSnapPayment({
        code: order.code,
        total: order.total,
        recipient: order.recipient,
        phone: order.phone,
        email: user.email,
      });
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Gagal memulai pembayaran." };
    }
    await db.order.update({ where: { id: order.id }, data: { paymentUrl: url } });
  }
  redirect(url);
}

export async function cancelMyOrder(code: string) {
  const user = await requireUser(`/akun/pesanan/${code}`);
  const order = await db.order.findFirst({ where: { code, userId: user.id } });
  if (order) await cancelOrder(order.id, true);
  redirect(`/akun/pesanan/${code}`);
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Isi nama Anda.").max(80),
  email: z.string().trim().email("Format email tidak valid."),
  body: z.string().trim().min(10, "Pesan terlalu singkat (minimal 10 karakter).").max(2000),
});

export async function sendMessage(_: FormState, fd: FormData): Promise<FormState> {
  // Perlindungan spam: kolom jebakan (honeypot) + pembatasan per IP.
  if (String(fd.get("website") ?? "") !== "") return { ok: "Terima kasih, pesan Anda sudah kami terima." };
  const keep = values(fd, ["name", "email", "body"]);
  if (!hit(`contact:${await clientIp()}`, 3, 10 * 60 * 1000).ok) {
    return { error: "Terlalu banyak pesan dalam waktu singkat. Coba lagi beberapa menit lagi.", values: keep };
  }
  const parsed = contactSchema.safeParse({
    name: fd.get("name"),
    email: fd.get("email"),
    body: fd.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message, values: keep };
  await db.message.create({ data: parsed.data });
  return { ok: "Terima kasih! Pesan Anda sudah kami terima dan akan dibalas secepatnya." };
}
