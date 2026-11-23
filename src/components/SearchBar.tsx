"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SearchIcon, CloseIcon } from "./Icons";
import { formatRupiah } from "@/lib/format";

type Result = {
  products: { slug: string; name: string; price: number; image: string }[];
  stories: { slug: string; title: string; cover: string }[];
};

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    setQ("");
    setRes(null);
  }, [pathname]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Saran muncul saat mengetik (ditunda 200 ms agar tidak membanjiri server).
  useEffect(() => {
    if (q.trim().length < 2) {
      setRes(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => {
          setRes(d);
          setLoading(false);
        })
        .catch(() => {});
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const empty = res && res.products.length === 0 && res.stories.length === 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Tutup pencarian" : "Buka pencarian"}
        aria-expanded={open}
        className="grid size-11 place-items-center rounded-md text-ink transition-colors hover:bg-sand"
      >
        {open ? <CloseIcon /> : <SearchIcon />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-16 z-40 border-b border-sand bg-ivory shadow-sm fade-in">
          <div className="wrap py-4">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
              }}
            >
              <label htmlFor="site-search" className="sr-only">Cari produk atau kisah</label>
              <input
                id="site-search"
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari abaya, warna, atau kisah…"
                autoComplete="off"
                className="input !py-3 text-base"
              />
            </form>

            <div aria-live="polite" className="mt-3 max-h-[60vh] overflow-y-auto">
              {loading && <p className="py-2 text-sm text-muted">Mencari…</p>}
              {empty && !loading && (
                <p className="py-2 text-sm text-muted">
                  Tidak ada hasil untuk “{q}”. <Link href="/shop" className="link">Lihat semua koleksi</Link>
                </p>
              )}
              {res && !loading && (res.products.length > 0 || res.stories.length > 0) && (
                <div className="grid gap-5 sm:grid-cols-2">
                  {res.products.length > 0 && (
                    <div>
                      <p className="caps mb-2 text-muted">Produk</p>
                      <ul>
                        {res.products.map((p) => (
                          <li key={p.slug}>
                            <Link href={`/shop/${p.slug}`} className="flex items-center gap-3 rounded-md p-2 hover:bg-sand">
                              {p.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.image} alt="" className="h-14 w-11 rounded-sm object-cover" />
                              )}
                              <span className="text-sm">
                                <span className="block font-medium">{p.name}</span>
                                <span className="text-muted">{formatRupiah(p.price)}</span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {res.stories.length > 0 && (
                    <div>
                      <p className="caps mb-2 text-muted">Kisah</p>
                      <ul>
                        {res.stories.map((s) => (
                          <li key={s.slug}>
                            <Link href={`/kisah/${s.slug}`} className="block rounded-md p-2 text-sm hover:bg-sand">
                              {s.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {q.trim().length >= 2 && (
                <p className="mt-3 text-xs text-muted">Tekan Enter untuk melihat semua hasil.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
