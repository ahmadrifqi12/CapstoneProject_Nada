import type { Metadata } from "next";
import Link from "next/link";
import { listActiveProducts, toCard } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Shop",
  description: "Seluruh koleksi abaya NADA. Pilih warna dan lihat langsung fotonya.",
};

const SORTS = [
  { key: "terbaru", label: "Terbaru" },
  { key: "termurah", label: "Harga terendah" },
  { key: "termahal", label: "Harga tertinggi" },
] as const;

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ urut?: string }> }) {
  const { urut } = await searchParams;
  const sort = SORTS.find((s) => s.key === urut)?.key ?? "terbaru";
  const products = await listActiveProducts({ sort });

  return (
    <div className="wrap pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="caps text-deep">Shop</p>
          <h1 className="mt-2 text-5xl">Semua koleksi</h1>
        </div>
        <nav aria-label="Urutkan produk" className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <Link
              key={s.key}
              href={s.key === "terbaru" ? "/shop" : `/shop?urut=${s.key}`}
              aria-current={sort === s.key ? "true" : undefined}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors duration-200 ${
                sort === s.key ? "border-deep bg-deep text-white" : "border-stone/50 hover:border-deep"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </header>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-muted">Belum ada produk. Segera hadir.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {products.map((p, i) => <ProductCard key={p.id} p={toCard(p)} priority={i < 4} />)}
        </div>
      )}
    </div>
  );
}
