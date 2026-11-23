"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

/** Mengosongkan keranjang setelah pesanan berhasil dibuat. */
export function ClearCart() {
  const { clear, ready } = useCart();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}
