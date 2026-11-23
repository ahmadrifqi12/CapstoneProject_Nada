import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { productInclude, publishedStoryWhere, toDetailColors } from "@/lib/catalog";
import { ProductView } from "@/components/ProductView";
import { truncate } from "@/lib/format";

async function load(slug: string) {
  return db.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      ...productInclude,
      stories: { where: publishedStoryWhere(), select: { slug: true, title: true } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return { title: "Produk tidak ditemukan" };
  const img = p.colors[0]?.images[0]?.url;
  return {
    title: p.name,
    description: truncate(p.description || `${p.name} — abaya NADA.`, 160),
    openGraph: img ? { images: [img] } : undefined,
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ warna?: string }>;
}) {
  const [{ slug }, { warna }] = await Promise.all([params, searchParams]);
  const p = await load(slug);
  if (!p) notFound();

  return (
    <div className="wrap pt-8">
      <nav aria-label="Jejak halaman" className="mb-6 text-sm text-muted">
        <Link href="/shop" className="hover:text-deep">Shop</Link> <span aria-hidden>/</span> <span className="text-ink">{p.name}</span>
      </nav>
      <ProductView
        name={p.name}
        price={p.price}
        category={p.category}
        description={p.description}
        material={p.material}
        colors={toDetailColors(p)}
        initialColorId={Number(warna) || undefined}
        stories={p.stories}
      />
    </div>
  );
}
