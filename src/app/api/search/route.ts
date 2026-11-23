import { NextResponse } from "next/server";
import { searchCatalog } from "@/lib/catalog";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.slice(0, 80) ?? "";
  if (q.trim().length < 2) return NextResponse.json({ products: [], stories: [] });
  const { products, stories } = await searchCatalog(q, { products: 5, stories: 3 });
  return NextResponse.json({
    products: products.map((p) => ({
      slug: p.slug,
      name: p.name,
      price: p.price,
      image: p.colors[0]?.images[0]?.url ?? "",
    })),
    stories: stories.map((s) => ({ slug: s.slug, title: s.title, cover: s.cover })),
  });
}
