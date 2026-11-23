import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = { title: "Keranjang", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="wrap pt-10">
      <h1 className="text-5xl">Keranjang</h1>
      <CartView />
    </div>
  );
}
