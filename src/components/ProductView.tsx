"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { useCart } from "./CartProvider";
import { CheckIcon, MinusIcon, PlusIcon } from "./Icons";
import type { DetailColor } from "@/lib/catalog";

type Props = {
  name: string;
  price: number;
  category: string;
  description: string;
  material: string;
  colors: DetailColor[];
  initialColorId?: number;
  stories: { slug: string; title: string }[];
};

export function ProductView({ name, price, category, description, material, colors, initialColorId, stories }: Props) {
  const startIdx = Math.max(0, colors.findIndex((c) => c.id === initialColorId));
  const [ci, setCi] = useState(startIdx);
  const [ii, setIi] = useState(0);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [needSize, setNeedSize] = useState(false);
  const { add } = useCart();

  const color = colors[ci];
  const variant = color?.variants.find((v) => v.id === variantId) ?? null;
  const soldOut = !color || color.variants.every((v) => v.stock <= 0);

  function pickColor(i: number) {
    setCi(i);
    setIi(0);
    setAdded(false);
    // Pertahankan ukuran yang sama bila masih tersedia pada warna baru.
    const prev = color?.variants.find((v) => v.id === variantId)?.size;
    const same = colors[i].variants.find((v) => v.size === prev && v.stock > 0);
    setVariantId(same?.id ?? null);
    setQty(1);
  }

  function addToCart() {
    if (!variant) {
      setNeedSize(true);
      return;
    }
    add(variant.id, qty);
    setAdded(true);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
      {/* Galeri foto per warna */}
      <div>
        <div className="aspect-[3/4] overflow-hidden rounded-lg bg-sand">
          {color?.images[ii] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={color.images[ii]} src={color.images[ii]} alt={`${name} warna ${color.name}, foto ${ii + 1}`} width={900} height={1200} className="fade-in h-full w-full object-cover" />
          )}
        </div>
        {color && color.images.length > 1 && (
          <ul className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
            {color.images.map((src, i) => (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => setIi(i)}
                  aria-label={`Lihat foto ${i + 1}`}
                  aria-current={i === ii}
                  className={`block aspect-[3/4] w-full overflow-hidden rounded-md border-2 transition-colors duration-200 ${i === ii ? "border-deep" : "border-transparent hover:border-sage"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Info & pembelian */}
      <div className="lg:pt-4">
        <p className="caps text-deep">{category}</p>
        <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">{name}</h1>
        <p className="mt-3 text-2xl">{formatRupiah(price)}</p>

        {description && <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-ink">{description}</p>}

        <fieldset className="mt-8">
          <legend className="text-sm font-medium">
            Warna: <span className="font-normal text-muted">{color?.name}</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-1">
            {colors.map((c, i) => {
              const out = c.variants.every((v) => v.stock <= 0);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickColor(i)}
                  aria-label={`Warna ${c.name}${out ? " (habis)" : ""}`}
                  aria-pressed={i === ci}
                  title={c.name}
                  className="grid size-10 place-items-center rounded-full"
                >
                  <span
                    className={`block size-7 rounded-full border border-black/10 transition-all duration-200 ${i === ci ? "outline outline-1 outline-offset-2 outline-deep" : ""} ${out ? "opacity-40" : ""}`}
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium">Ukuran</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {color?.variants.map((v) => {
              const out = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={out}
                  onClick={() => {
                    setVariantId(v.id);
                    setNeedSize(false);
                    setAdded(false);
                    setQty((q) => Math.min(q, v.stock));
                  }}
                  aria-pressed={v.id === variantId}
                  className={`min-h-11 min-w-14 rounded-md border px-4 text-sm transition-colors duration-200 ${
                    v.id === variantId ? "border-deep bg-deep text-white" : "border-stone/60 hover:border-deep"
                  } ${out ? "cursor-not-allowed line-through opacity-50 hover:border-stone/60" : ""}`}
                >
                  {v.size}
                  {out && <span className="sr-only"> (habis)</span>}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-sm text-muted" aria-live="polite">
            {soldOut ? "Habis — warna ini sedang tidak tersedia." : variant ? (variant.stock <= 3 ? `Tersisa ${variant.stock} item` : "Stok tersedia") : "Pilih ukuran untuk melihat stok."}
          </p>
          {needSize && <p role="alert" className="mt-1 text-sm text-ink">Silakan pilih ukuran terlebih dahulu.</p>}
        </fieldset>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center rounded-md border border-stone/60" role="group" aria-label="Jumlah">
            <button type="button" aria-label="Kurangi jumlah" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-11 place-items-center hover:bg-sand"><MinusIcon width={16} /></button>
            <span className="w-8 text-center text-sm" aria-live="polite">{qty}</span>
            <button type="button" aria-label="Tambah jumlah" onClick={() => setQty((q) => Math.min(variant?.stock ?? 10, q + 1))} className="grid size-11 place-items-center hover:bg-sand"><PlusIcon width={16} /></button>
          </div>
          <button type="button" onClick={addToCart} disabled={soldOut} className="btn-primary flex-1 sm:flex-none sm:px-10">
            {soldOut ? "Habis" : "Tambah ke keranjang"}
          </button>
        </div>

        {added && (
          <p role="status" className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-sage bg-sage/30 px-4 py-3 text-sm">
            <CheckIcon width={18} className="text-deep" /> Ditambahkan ke keranjang.
            <Link href="/cart" className="link">Lihat keranjang</Link>
          </p>
        )}

        {material && (
          <div className="mt-10 border-t border-sand pt-6">
            <h2 className="caps text-muted">Bahan &amp; perawatan</h2>
            <p className="mt-2 text-[15px]">{material}</p>
          </div>
        )}

        {stories.length > 0 && (
          <div className="mt-6 border-t border-sand pt-6">
            <h2 className="caps text-muted">Kisah di balik koleksi ini</h2>
            <ul className="mt-2 space-y-1">
              {stories.map((s) => (
                <li key={s.slug}><Link href={`/kisah/${s.slug}`} className="link font-serif text-xl">{s.title}</Link></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
