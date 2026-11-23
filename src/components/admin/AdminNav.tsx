"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Ringkasan", exact: true },
  { href: "/admin/produk", label: "Produk" },
  { href: "/admin/kisah", label: "Kisah" },
  { href: "/admin/pesanan", label: "Pesanan" },
  { href: "/admin/pesan", label: "Pesan Contact" },
  { href: "/admin/pengaturan", label: "Pengaturan" },
];

export function AdminNav({ badges }: { badges: Record<string, number> }) {
  const path = usePathname();
  return (
    <nav aria-label="Menu admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
      {ITEMS.map((i) => {
        const active = i.exact ? path === i.href : path.startsWith(i.href);
        const n = badges[i.href];
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 ${
              active ? "bg-deep text-white" : "hover:bg-sand"
            }`}
          >
            {i.label}
            {n > 0 && (
              <span className={`grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] leading-5 ${active ? "bg-white/25" : "bg-clay text-ink"}`}>{n}</span>
            )}
          </Link>
        );
      })}
      <Link href="/" target="_blank" className="shrink-0 rounded-md px-3 py-2.5 text-sm hover:bg-sand lg:hidden">Lihat situs ↗</Link>
    </nav>
  );
}
