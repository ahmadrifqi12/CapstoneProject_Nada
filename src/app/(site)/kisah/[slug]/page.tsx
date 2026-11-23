import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { productInclude, publishedStoryWhere, toCard } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";

async function load(slug: string) {
  return db.story.findFirst({
    where: { slug, ...publishedStoryWhere() },
    include: { products: { where: { status: "ACTIVE" }, include: productInclude } },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = await load((await params).slug);
  if (!s) return { title: "Kisah tidak ditemukan" };
  return {
    title: s.title,
    description: s.excerpt,
    openGraph: { type: "article", images: s.cover ? [s.cover] : undefined },
  };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const s = await load((await params).slug);
  if (!s) notFound();

  return (
    <article className="pt-10">
      <header className="wrap max-w-3xl text-center">
        <p className="caps text-deep">{formatDate(s.publishedAt)}</p>
        <h1 className="mt-3 text-4xl leading-tight sm:text-6xl">{s.title}</h1>
        {s.excerpt && <p className="mt-5 text-lg text-muted">{s.excerpt}</p>}
      </header>

      {s.cover && (
        <div className="wrap mt-10 max-w-4xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.cover} alt="" width={1200} height={800} className="aspect-[3/2] w-full rounded-lg object-cover" />
        </div>
      )}

      {/* Isi sudah disanitasi di server saat disimpan (lihat cleanStoryHtml). */}
      <div className="wrap mt-10 max-w-2xl">
        <div className="prose-nada" dangerouslySetInnerHTML={{ __html: s.body }} />
        {s.products.length > 0 && (
          <div className="mt-10 text-center">
            <Link href={`/shop/${s.products[0].slug}`} className="btn-primary">Lihat koleksi ini</Link>
          </div>
        )}
      </div>

      {s.products.length > 1 && (
        <section className="wrap mt-16">
          <h2 className="mb-6 text-3xl">Koleksi dalam kisah ini</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {s.products.map((p) => <ProductCard key={p.id} p={toCard(p)} />)}
          </div>
        </section>
      )}

      <div className="wrap mt-16 max-w-2xl border-t border-sand pt-6">
        <Link href="/kisah" className="link text-sm">← Semua kisah</Link>
      </div>
    </article>
  );
}
