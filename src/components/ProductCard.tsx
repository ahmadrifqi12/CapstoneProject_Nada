"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import type { CardProduct } from "@/lib/catalog";

export function ProductCard({ p, priority = false }: { p: CardProduct; priority?: boolean }) {
  const [idx, setIdx] = useState(0);
  const c = p.colors[idx];
  // Warna terpilih ikut terbawa ke halaman detail lewat parameter ?warna=
  const href = `/shop/${p.slug}${c ? `?warna=${c.id}` : ""}`;

  return (
    <article className="group">
      <Link href={href} className="relative block aspect-[3/4] overflow-hidden rounded-md bg-sand" aria-label={`${p.name}, warna ${c?.name ?? ""}`}>
        {c?.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={c.id}
            src={c.image}
            alt={`${p.name} warna ${c.name}`}
            width={600}
            height={800}
            loading={priority ? "eager" : "lazy"}
            className="fade-in h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}
        <span className="absolute left-2 top-2 flex gap-1">
          {p.soldOut ? <span className="badge">Habis</span> : p.isNew ? <span className="badge">Baru</span> : null}
        </span>
      </Link>

      <div className="mt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-xl leading-tight">
            <Link href={href} className="hover:text-deep">{p.name}</Link>
          </h3>
          <p className="shrink-0 text-sm text-ink">{formatRupiah(p.price)}</p>
        </div>

        {p.colors.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-0.5" role="group" aria-label={`Pilih warna ${p.name}`}>
            {p.colors.map((col, i) => (
              <button
                key={col.id}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Warna ${col.name}${col.soldOut ? " (habis)" : ""}`}
                aria-pressed={i === idx}
                title={col.name}
                className="grid size-7 place-items-center rounded-full"
              >
                <span
                  className={`block size-[18px] rounded-full border border-black/10 transition-all duration-200 ${
                    i === idx ? "outline outline-1 outline-offset-2 outline-deep" : ""
                  } ${col.soldOut ? "opacity-40" : ""}`}
                  style={{ backgroundColor: col.hex }}
                />
              </button>
            ))}
            <span className="ml-1.5 text-xs text-muted" aria-live="polite">{c?.name}</span>
          </div>
        )}
      </div>
    </article>
  );
}
