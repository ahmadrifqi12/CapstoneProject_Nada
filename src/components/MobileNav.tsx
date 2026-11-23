"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, CloseIcon } from "./Icons";
import { logout } from "@/actions/auth";
import { NAV } from "@/lib/constants";

export function MobileNav({ userName }: { userName: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
        aria-expanded={open}
        className="grid size-11 place-items-center rounded-md hover:bg-sand"
      >
        <MenuIcon />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-ivory fade-in" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex h-16 items-center justify-between px-4">
            <span className="font-serif text-2xl tracking-[0.14em]">NADA</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Tutup menu" className="grid size-11 place-items-center rounded-md hover:bg-sand">
              <CloseIcon />
            </button>
          </div>
          <nav className="wrap mt-6 flex flex-col">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="border-b border-sand py-4 font-serif text-3xl">
                {n.label}
              </Link>
            ))}
            <div className="mt-8 flex flex-col gap-3 text-sm">
              {userName ? (
                <>
                  <Link href="/akun" className="btn-outline">Akun saya ({userName})</Link>
                  <form action={logout}><button className="btn-quiet w-full">Keluar</button></form>
                </>
              ) : (
                <>
                  <Link href="/masuk" className="btn-primary">Masuk</Link>
                  <Link href="/daftar" className="btn-outline">Daftar</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
