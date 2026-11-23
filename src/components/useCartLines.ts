"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "./CartProvider";
import type { CartLine } from "@/app/api/cart/route";

/** Menggabungkan isi keranjang (id + jumlah) dengan data terbaru produk dari server. */
export function useCartLines() {
  const { items, ready, setQty, remove } = useCart();
  const [info, setInfo] = useState<Map<number, CartLine> | null>(null);

  const ids = items.map((i) => i.variantId).sort().join(",");

  useEffect(() => {
    if (!ready) return;
    if (items.length === 0) {
      setInfo(new Map());
      return;
    }
    let cancelled = false;
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((r) => r.json())
      .then((d: { lines: CartLine[] }) => {
        if (!cancelled) setInfo(new Map(d.lines.map((l) => [l.variantId, l])));
      })
      .catch(() => !cancelled && setInfo(new Map()));
    return () => {
      cancelled = true;
    };
    // Muat ulang hanya saat himpunan varian berubah, bukan tiap jumlah berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, ids]);

  // Buang varian yang sudah tidak ada; sesuaikan jumlah dengan stok.
  useEffect(() => {
    if (!info) return;
    for (const it of items) {
      const l = info.get(it.variantId);
      if (!l) remove(it.variantId);
      else if (l.stock > 0 && it.qty > l.stock) setQty(it.variantId, l.stock);
    }
  }, [info, items, remove, setQty]);

  const lines = useMemo(
    () =>
      info
        ? items.flatMap((it) => {
            const l = info.get(it.variantId);
            return l ? [{ ...l, qty: it.qty }] : [];
          })
        : [],
    [info, items],
  );

  const loading = !ready || info === null;
  const subtotal = lines.reduce((t, l) => t + l.price * l.qty, 0);
  const blocked = lines.some((l) => l.stock <= 0 || l.qty > l.stock);
  return { lines, loading, subtotal, blocked };
}
