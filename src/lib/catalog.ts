import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { SIZES } from "./constants";

export const productInclude = {
  colors: {
    orderBy: { position: "asc" },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
    },
  },
} satisfies Prisma.ProductInclude;

export type ProductFull = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

const sizeOrder = (s: string) => {
  const i = (SIZES as readonly string[]).indexOf(s);
  return i === -1 ? 99 : i;
};

export type CardColor = { id: number; name: string; hex: string; image: string; soldOut: boolean };
export type CardProduct = {
  id: number;
  slug: string;
  name: string;
  price: number;
  category: string;
  isNew: boolean;
  soldOut: boolean;
  colors: CardColor[];
};

const NEW_DAYS = 30;

export function toCard(p: ProductFull): CardProduct {
  const colors = p.colors.map((c) => ({
    id: c.id,
    name: c.name,
    hex: c.hex,
    image: c.images[0]?.url ?? "",
    soldOut: c.variants.every((v) => v.stock <= 0),
  }));
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    category: p.category,
    isNew: Date.now() - p.createdAt.getTime() < NEW_DAYS * 86400000,
    soldOut: colors.length > 0 && colors.every((c) => c.soldOut),
    colors,
  };
}

export type DetailColor = {
  id: number;
  name: string;
  hex: string;
  images: string[];
  variants: { id: number; size: string; stock: number }[];
};

export function toDetailColors(p: ProductFull): DetailColor[] {
  return p.colors.map((c) => ({
    id: c.id,
    name: c.name,
    hex: c.hex,
    images: c.images.map((i) => i.url),
    variants: [...c.variants]
      .sort((a, b) => sizeOrder(a.size) - sizeOrder(b.size))
      .map((v) => ({ id: v.id, size: v.size, stock: v.stock })),
  }));
}

export async function listActiveProducts(opts: {
  sort?: "terbaru" | "termurah" | "termahal";
  take?: number;
  featured?: boolean;
} = {}) {
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    opts.sort === "termurah"
      ? { price: "asc" }
      : opts.sort === "termahal"
        ? { price: "desc" }
        : { createdAt: "desc" };
  return db.product.findMany({
    where: { status: "ACTIVE", ...(opts.featured ? { featured: true } : {}) },
    orderBy,
    take: opts.take,
    include: productInclude,
  });
}

/** Kisah yang sudah terbit (status terbit dan tanggal terbit tidak di masa depan). */
export const publishedStoryWhere = (): Prisma.StoryWhereInput => ({
  status: "PUBLISHED",
  publishedAt: { lte: new Date() },
});

export async function searchCatalog(q: string, limits = { products: 24, stories: 12 }) {
  const term = q.trim();
  if (!term) return { products: [], stories: [] };
  // SQLite: LIKE tidak peka huruf besar-kecil untuk ASCII. Pada PostgreSQL tambahkan mode: "insensitive".
  const [products, stories] = await Promise.all([
    db.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: term } },
          { category: { contains: term } },
          { colors: { some: { name: { contains: term } } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: limits.products,
      include: productInclude,
    }),
    db.story.findMany({
      where: { ...publishedStoryWhere(), title: { contains: term } },
      orderBy: { publishedAt: "desc" },
      take: limits.stories,
    }),
  ]);
  return { products, stories };
}

export async function uniqueSlug(
  model: "product" | "story",
  base: string,
  ignoreId?: number,
): Promise<string> {
  let slug = base;
  let n = 2;
  for (;;) {
    const found =
      model === "product"
        ? await db.product.findUnique({ where: { slug }, select: { id: true } })
        : await db.story.findUnique({ where: { slug }, select: { id: true } });
    if (!found || found.id === ignoreId) return slug;
    slug = `${base}-${n++}`;
  }
}
