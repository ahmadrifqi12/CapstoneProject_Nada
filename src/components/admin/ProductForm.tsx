"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveProduct, type ProductPayload } from "@/actions/admin";
import { SIZES, CATEGORIES } from "@/lib/constants";
import { MultiImageField } from "./ImageFields";
import { FormMessage } from "../ui";
import { PlusIcon, TrashIcon } from "../Icons";
import type { FormState } from "@/actions/auth";

export type InitialProduct = {
  id?: number;
  name: string;
  category: string;
  price: number | "";
  description: string;
  material: string;
  featured: boolean;
  status: string;
  storyIds: number[];
  colors: { id?: number; name: string; hex: string; images: string[]; stocks: Record<string, number | null> }[];
};

type ColorState = {
  key: string;
  id?: number;
  name: string;
  hex: string;
  images: string[];
  stocks: Record<string, string>;
};

let seq = 0;
const newKey = () => `c${++seq}`;

const blankColor = (): ColorState => ({
  key: newKey(),
  name: "",
  hex: "#d8c8ae",
  images: [],
  stocks: Object.fromEntries(SIZES.map((s) => [s, ""])),
});

export function ProductForm({
  initial,
  stories,
}: {
  initial: InitialProduct;
  stories: { id: number; title: string }[];
}) {
  const [name, setName] = useState(initial.name);
  const [category, setCategory] = useState(initial.category);
  const [price, setPrice] = useState(String(initial.price));
  const [description, setDescription] = useState(initial.description);
  const [material, setMaterial] = useState(initial.material);
  const [featured, setFeatured] = useState(initial.featured);
  const [storyIds, setStoryIds] = useState<number[]>(initial.storyIds);
  const [colors, setColors] = useState<ColorState[]>(
    initial.colors.length
      ? initial.colors.map((c) => ({
          key: newKey(),
          id: c.id,
          name: c.name,
          hex: c.hex,
          images: c.images,
          stocks: Object.fromEntries(SIZES.map((s) => [s, c.stocks[s] == null ? "" : String(c.stocks[s])])),
        }))
      : [blankColor()],
  );
  const [state, setState] = useState<FormState>();
  const [pending, start] = useTransition();
  const isActive = initial.status === "ACTIVE";

  const patch = (key: string, p: Partial<ColorState>) =>
    setColors((cs) => cs.map((c) => (c.key === key ? { ...c, ...p } : c)));

  function submit(status: "DRAFT" | "ACTIVE") {
    const payload: ProductPayload = {
      id: initial.id,
      name,
      category,
      price: Number(price),
      description,
      material,
      featured,
      storyIds,
      colors: colors.map((c) => ({
        id: c.id,
        name: c.name,
        hex: c.hex,
        images: c.images,
        stocks: Object.fromEntries(
          SIZES.map((s) => [s, c.stocks[s].trim() === "" ? null : Math.max(0, Math.floor(Number(c.stocks[s])))]),
        ),
      })),
    };
    start(async () => setState(await saveProduct(payload, status)));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(isActive ? "ACTIVE" : "DRAFT");
      }}
      className="space-y-10"
    >
      {/* 1. Info dasar */}
      <section className="card space-y-4 p-5 sm:p-6">
        <h2 className="text-2xl">1. Informasi produk</h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_200px_200px]">
          <div>
            <label htmlFor="p-name" className="field-label">Nama produk</label>
            <input id="p-name" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="p-price" className="field-label">Harga (Rp)</label>
            <input id="p-price" className="input" type="number" min={1000} step={1000} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="p-cat" className="field-label">Kategori</label>
            <select id="p-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {[...new Set([...CATEGORIES, category])].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="p-desc" className="field-label">Deskripsi</label>
          <textarea id="p-desc" className="input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label htmlFor="p-mat" className="field-label">Bahan &amp; perawatan</label>
          <textarea id="p-mat" className="input" rows={2} value={material} onChange={(e) => setMaterial(e.target.value)} />
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" className="size-5 accent-[#5f705f]" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Tampilkan di Beranda (koleksi terpilih)
        </label>
      </section>

      {/* 2. Warna */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-2xl">2. Warna, foto, ukuran &amp; stok</h2>
          <button type="button" className="btn-outline !min-h-10" onClick={() => setColors((c) => [...c, blankColor()])}>
            <PlusIcon width={16} /> Tambah warna
          </button>
        </div>

        {colors.map((c, idx) => (
          <fieldset key={c.key} className="card space-y-5 p-5 sm:p-6">
            <legend className="sr-only">Warna {idx + 1}</legend>
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[200px] flex-1">
                <label htmlFor={`cn-${c.key}`} className="field-label">Nama warna #{idx + 1}</label>
                <input id={`cn-${c.key}`} className="input" value={c.name} placeholder="mis. Sage" onChange={(e) => patch(c.key, { name: e.target.value })} />
              </div>
              <div>
                <label htmlFor={`ch-${c.key}`} className="field-label">Kode warna (swatch)</label>
                <div className="flex items-center gap-2">
                  <input id={`ch-${c.key}`} type="color" value={c.hex} onChange={(e) => patch(c.key, { hex: e.target.value })} className="h-11 w-14 cursor-pointer rounded-md border border-stone/60 bg-white p-1" />
                  <input aria-label="Kode warna heksadesimal" className="input !w-28 font-mono text-sm" value={c.hex} maxLength={7} onChange={(e) => patch(c.key, { hex: e.target.value })} />
                </div>
              </div>
              {colors.length > 1 && (
                <button type="button" className="btn-quiet" onClick={() => setColors((cs) => cs.filter((x) => x.key !== c.key))}>
                  <TrashIcon width={16} /> Hapus warna
                </button>
              )}
            </div>

            <div>
              <p className="field-label">Foto untuk warna ini</p>
              <MultiImageField value={c.images} onChange={(v) => patch(c.key, { images: v })} />
            </div>

            <div>
              <p className="field-label">Stok per ukuran <span className="font-normal text-muted">(kosongkan bila ukuran tidak dijual)</span></p>
              <div className="flex flex-wrap gap-3">
                {SIZES.map((s) => (
                  <div key={s} className="w-24">
                    <label htmlFor={`s-${c.key}-${s}`} className="mb-1 block text-center text-sm font-medium">{s}</label>
                    <input
                      id={`s-${c.key}-${s}`}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      className="input text-center"
                      value={c.stocks[s]}
                      onChange={(e) => patch(c.key, { stocks: { ...c.stocks, [s]: e.target.value } })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </fieldset>
        ))}
      </section>

      {/* 3. Kisah */}
      <section className="card space-y-3 p-5 sm:p-6">
        <h2 className="text-2xl">3. Kisah koleksi <span className="text-base font-normal text-muted">(opsional)</span></h2>
        {stories.length === 0 ? (
          <p className="text-sm text-muted">Belum ada kisah. Anda bisa menulisnya nanti dan menautkannya dari halaman Kisah.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {stories.map((s) => (
              <li key={s.id}>
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="size-5 accent-[#5f705f]"
                    checked={storyIds.includes(s.id)}
                    onChange={(e) => setStoryIds((ids) => (e.target.checked ? [...ids, s.id] : ids.filter((i) => i !== s.id)))}
                  />
                  {s.title}
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="sticky bottom-0 -mx-4 space-y-3 border-t border-sand bg-ivory/95 px-4 py-4 sm:mx-0 sm:px-0">
        <FormMessage state={state} />
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={pending} onClick={() => submit("ACTIVE")} className="btn-primary">
            {pending ? "Menyimpan…" : isActive ? "Simpan perubahan" : "Aktifkan produk"}
          </button>
          <button type="button" disabled={pending} onClick={() => submit("DRAFT")} className="btn-outline">
            {isActive ? "Jadikan draf" : "Simpan sebagai draf"}
          </button>
          <Link href="/admin/produk" className="btn-quiet">Batal</Link>
        </div>
      </div>
    </form>
  );
}
