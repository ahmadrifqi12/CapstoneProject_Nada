"use client";

import Link from "next/link";
import { BagIcon } from "./Icons";
import { useCart } from "./CartProvider";

export function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={`Keranjang${ready && count ? `, ${count} item` : ""}`}
      className="relative grid size-11 place-items-center rounded-md hover:bg-sand"
    >
      <BagIcon />
      {ready && count > 0 && (
        <span className="absolute right-1 top-1 grid min-w-[18px] place-items-center rounded-full bg-deep px-1 text-[10px] font-medium leading-[18px] text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
