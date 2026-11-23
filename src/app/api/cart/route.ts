import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  items: z
    .array(z.object({ variantId: z.number().int().positive(), qty: z.number().int().min(1).max(99) }))
    .max(50),
});

export type CartLine = {
  variantId: number;
  qty: number;
  name: string;
  slug: string;
  colorName: string;
  colorHex: string;
  size: string;
  price: number;
  image: string;
  stock: number;
};

/** Mengubah isi keranjang (hanya id varian dan jumlah) menjadi data terbaru dari database. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ lines: [] }, { status: 400 });
  const { items } = parsed.data;
  const variants = await db.productVariant.findMany({
    where: { id: { in: items.map((i) => i.variantId) }, color: { product: { status: "ACTIVE" } } },
    include: { color: { include: { product: true, images: { orderBy: { position: "asc" }, take: 1 } } } },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));
  const lines: CartLine[] = [];
  for (const it of items) {
    const v = byId.get(it.variantId);
    if (!v) continue;
    lines.push({
      variantId: v.id,
      qty: it.qty,
      name: v.color.product.name,
      slug: v.color.product.slug,
      colorName: v.color.name,
      colorHex: v.color.hex,
      size: v.size,
      price: v.color.product.price,
      image: v.color.images[0]?.url ?? "",
      stock: v.stock,
    });
  }
  return NextResponse.json({ lines });
}
