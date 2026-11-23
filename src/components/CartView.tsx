"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { useCartLines } from "./useCartLines";
import { formatRupiah } from "@/lib/format";
import { MinusIcon, PlusIcon, TrashIcon } from "./Icons";

export function CartView() {
  const { setQty, remove } = useCart();
  const { lines, loading, subtotal, blocked } = useCartLines();

  if (loading) return <p className="mt-10 text-muted" role="status">Memuat keranjang…</p>;

  if (lines.length === 0) {
    return (
      <div className="mt-10 rounded-lg bg-sand/60 p-10 text-center">
        <p className="font-serif text-3xl">Keranjangmu masih kosong.</p>
        <p className="mt-2 text-muted">Temukan abaya yang terasa seperti kamu.</p>
        <Link href="/shop" className="btn-primary mt-6">Mulai belanja</Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-sand border-y border-sand">
        {lines.map((l) => {
          const out = l.stock <= 0;
          return (
            <li key={l.variantId} className="flex gap-4 py-5">
              <Link href={`/shop/${l.slug}`} className="block w-24 shrink-0 sm:w-28">
                <div className="aspect-[3/4] overflow-hidden rounded-md bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {l.image && <img src={l.image} alt={`${l.name} warna ${l.colorName}`} className="h-full w-full object-cover" />}
                </div>
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link href={`/shop/${l.slug}`} className="font-serif text-2xl leading-tight hover:text-deep">{l.name}</Link>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                      <span className="inline-block size-3.5 rounded-full border border-black/10" style={{ backgroundColor: l.colorHex }} aria-hidden />
                      {l.colorName} · Ukuran {l.size}
                    </p>
                  </div>
                  <p className="text-sm">{formatRupiah(l.price)}</p>
                </div>

                {out ? (
                  <p role="alert" className="mt-2 text-sm font-medium">Varian ini sudah habis. Hapus dari keranjang untuk melanjutkan.</p>
                ) : (
                  <p className="mt-2 text-xs text-muted">Stok tersisa {l.stock}</p>
                )}

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center rounded-md border border-stone/60" role="group" aria-label={`Jumlah ${l.name}`}>
                    <button type="button" aria-label="Kurangi jumlah" onClick={() => setQty(l.variantId, l.qty - 1)} className="grid size-10 place-items-center hover:bg-sand"><MinusIcon width={16} /></button>
                    <span className="w-8 text-center text-sm">{l.qty}</span>
                    <button type="button" aria-label="Tambah jumlah" disabled={l.qty >= l.stock} onClick={() => setQty(l.variantId, l.qty + 1)} className="grid size-10 place-items-center hover:bg-sand disabled:opacity-40"><PlusIcon width={16} /></button>
                  </div>
                  <button type="button" onClick={() => remove(l.variantId)} className="btn-quiet !min-h-10 text-sm">
                    <TrashIcon width={16} /> Hapus
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="card h-fit p-6">
        <h2 className="text-2xl">Ringkasan</h2>
        <dl className="mt-4 space-y-2 text-[15px]">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatRupiah(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Ongkos kirim</dt><dd className="text-muted">Dihitung di checkout</dd></div>
        </dl>
        <Link href="/checkout" aria-disabled={blocked} className={`btn-primary mt-6 w-full ${blocked ? "pointer-events-none opacity-50" : ""}`}>
          Lanjut ke checkout
        </Link>
        <p className="mt-3 text-xs text-muted">Kamu perlu masuk ke akun untuk menyelesaikan pesanan.</p>
      </aside>
    </div>
  );
}
