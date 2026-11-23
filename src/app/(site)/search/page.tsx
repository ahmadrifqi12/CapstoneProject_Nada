import type { Metadata } from "next";
import Link from "next/link";
import { searchCatalog, toCard } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { StoryCard } from "@/components/StoryCard";

export const metadata: Metadata = { title: "Hasil pencarian", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);
  const { products, stories } = await searchCatalog(q);
  const none = products.length === 0 && stories.length === 0;

  return (
    <div className="wrap pt-10">
      <p className="caps text-deep">Pencarian</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">{q ? <>Hasil untuk “{q}”</> : "Cari di NADA"}</h1>

      {!q && <p className="mt-6 text-muted">Ketik kata kunci di kolom pencarian pada header.</p>}

      {q && none && (
        <div className="mt-10 rounded-lg bg-sand/60 p-8 text-center">
          <p className="font-serif text-2xl">Belum ada yang cocok dengan “{q}”.</p>
          <p className="mt-2 text-muted">Coba kata lain, misalnya nama warna atau kategori.</p>
          <Link href="/shop" className="btn-primary mt-6">Lihat semua koleksi</Link>
        </div>
      )}

      {products.length > 0 && (
        <section className="mt-10" aria-labelledby="hasil-produk">
          <h2 id="hasil-produk" className="mb-6 text-3xl">Produk <span className="text-base text-muted">({products.length})</span></h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {products.map((p) => <ProductCard key={p.id} p={toCard(p)} />)}
          </div>
        </section>
      )}

      {stories.length > 0 && (
        <section className="mt-16" aria-labelledby="hasil-kisah">
          <h2 id="hasil-kisah" className="mb-6 text-3xl">Kisah <span className="text-base text-muted">({stories.length})</span></h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((s) => <StoryCard key={s.id} s={s} />)}
          </div>
        </section>
      )}
    </div>
  );
}
