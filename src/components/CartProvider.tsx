"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = { variantId: number; qty: number };

type Ctx = {
  items: CartItem[];
  ready: boolean;
  count: number;
  add: (variantId: number, qty?: number) => void;
  setQty: (variantId: number, qty: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
};

const KEY = "nada_cart_v1";
const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Muat dari localStorage (dibungkus try/catch: bisa gagal di mode privat).
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (Array.isArray(raw)) {
        setItems(
          raw
            .filter((i) => Number.isInteger(i?.variantId) && Number.isInteger(i?.qty) && i.qty > 0)
            .map((i) => ({ variantId: i.variantId, qty: Math.min(99, i.qty) })),
        );
      }
    } catch {}
    setReady(true);
  }, []);

  // Simpan setiap perubahan, dan sinkronkan antar tab.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || e.newValue == null) return;
      try {
        setItems(JSON.parse(e.newValue));
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((variantId: number, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((i) => i.variantId === variantId);
      if (found) return cur.map((i) => (i === found ? { ...i, qty: Math.min(99, i.qty + qty) } : i));
      return [...cur, { variantId, qty: Math.min(99, qty) }];
    });
  }, []);
  const setQty = useCallback((variantId: number, qty: number) => {
    setItems((cur) =>
      qty <= 0
        ? cur.filter((i) => i.variantId !== variantId)
        : cur.map((i) => (i.variantId === variantId ? { ...i, qty: Math.min(99, qty) } : i)),
    );
  }, []);
  const remove = useCallback((variantId: number) => setItems((c) => c.filter((i) => i.variantId !== variantId)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, ready, count: items.reduce((n, i) => n + i.qty, 0), add, setQty, remove, clear }),
    [items, ready, add, setQty, remove, clear],
  );
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart harus dipakai di dalam CartProvider");
  return ctx;
}
