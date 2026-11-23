import Link from "next/link";
import { db } from "@/lib/db";
import { PRODUCT_STATUS_LABEL } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { duplicateProduct, setProductStatus } from "@/actions/admin";
import { productInclude } from "@/lib/catalog";

export const metadata = { title: "Produk" };

export default async function ProductsAdminPage({ searchParams }: { searchParams: Promise<{ disimpan?: string }> }) {
  const { disimpan } = await searchParams;
  const products = await db.product.findMany({ orderBy: { updatedAt: "desc" }, include: productInclude });

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-4xl">Produk</h1>
        <Link href="/admin/produk/baru" className="btn-primary">Tambah produk</Link>
      </div>
      {disimpan && <p role="status" className="mt-4 rounded-md border border-sage bg-sage/30 px-4 py-2.5 text-sm">Produk disimpan.</p>}

      {products.length === 0 ? (
        <p className="mt-10 text-muted">Belum ada produk.</p>
      ) : (
        <ul className="mt-6 divide-y divide-sand border-y border-sand">
          {products.map((p) => {
            const stock = p.colors.flatMap((c) => c.variants).reduce((n, v) => n + v.stock, 0);
            const img = p.colors[0]?.images[0]?.url;
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-4 py-4">
                <div className="aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-sm bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-[180px] flex-1">
                  <Link href={`/admin/produk/${p.id}`} className="font-medium hover:text-deep">{p.name}</Link>
                  <p className="text-sm text-muted">
                    {p.category} · {formatRupiah(p.price)} · {p.colors.length} warna · stok {stock}
                    {p.featured && " · ★ Beranda"}
                  </p>
                </div>
                <span className={p.status === "ACTIVE" ? "tag !bg-sage/60" : "tag"}>{PRODUCT_STATUS_LABEL[p.status]}</span>
                <div className="flex flex-wrap gap-1">
                  <Link href={`/admin/produk/${p.id}`} className="btn-quiet !min-h-9">Ubah</Link>
                  <form action={duplicateProduct.bind(null, p.id)}><button className="btn-quiet !min-h-9">Duplikasi</button></form>
                  {p.status === "ARCHIVED" || p.status === "DRAFT" ? (
                    <form action={setProductStatus.bind(null, p.id, "ACTIVE")}><button className="btn-quiet !min-h-9">Aktifkan</button></form>
                  ) : (
                    <form action={setProductStatus.bind(null, p.id, "ARCHIVED")}><button className="btn-quiet !min-h-9">Arsipkan</button></form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
