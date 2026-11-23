import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { publishedStoryWhere } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const [products, stories] = await Promise.all([
    db.product.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
    db.story.findMany({ where: publishedStoryWhere(), select: { slug: true, updatedAt: true } }),
  ]);
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/kisah`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/contact`, priority: 0.5 },
    ...products.map((p) => ({ url: `${base}/shop/${p.slug}`, lastModified: p.updatedAt, priority: 0.8 })),
    ...stories.map((s) => ({ url: `${base}/kisah/${s.slug}`, lastModified: s.updatedAt, priority: 0.7 })),
  ];
}
