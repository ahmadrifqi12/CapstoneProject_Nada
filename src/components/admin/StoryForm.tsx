"use client";

import Link from "next/link";
import { saveStory } from "@/actions/admin";
import { FormMessage, useFormAction } from "../ui";
import { SingleImageField } from "./ImageFields";
import { RichEditor } from "./RichEditor";

export type InitialStory = {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  cover: string;
  body: string;
  status: string;
  productIds: number[];
};

export function StoryForm({ initial, products }: { initial: InitialStory; products: { id: number; name: string }[] }) {
  const { state, onSubmit, pending } = useFormAction(saveStory);
  const published = initial.status === "PUBLISHED";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="card space-y-4 p-5 sm:p-6">
        <div>
          <label htmlFor="s-title" className="field-label">Judul kisah</label>
          <input id="s-title" name="title" defaultValue={initial.title} required minLength={3} className="input" />
        </div>
        <div>
          <label htmlFor="s-slug" className="field-label">Alamat halaman <span className="font-normal text-muted">(opsional, dibuat otomatis dari judul)</span></label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">/kisah/</span>
            <input id="s-slug" name="slug" defaultValue={initial.slug} className="input" placeholder="nama-koleksi" />
          </div>
        </div>
        <div>
          <label htmlFor="s-ex" className="field-label">Ringkasan <span className="font-normal text-muted">(tampil di kartu; kosongkan agar diambil dari isi)</span></label>
          <textarea id="s-ex" name="excerpt" defaultValue={initial.excerpt} rows={2} maxLength={300} className="input" />
        </div>
        <SingleImageField name="cover" initial={initial.cover} label="Gambar sampul" />
      </div>

      <div className="card space-y-3 p-5 sm:p-6">
        <p className="field-label">Isi kisah</p>
        <RichEditor name="body" initial={initial.body} />
      </div>

      <div className="card space-y-3 p-5 sm:p-6">
        <p className="field-label">Produk terkait <span className="font-normal text-muted">(muncul sebagai tombol “Lihat koleksi ini”)</span></p>
        {products.length === 0 ? (
          <p className="text-sm text-muted">Belum ada produk.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {products.map((p) => (
              <li key={p.id}>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" name="productIds" value={p.id} defaultChecked={initial.productIds.includes(p.id)} className="size-5 accent-[#5f705f]" />
                  {p.name}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        <FormMessage state={state} />
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" name="intent" value="publish" disabled={pending} className="btn-primary">
            {pending ? "Menyimpan…" : published ? "Simpan perubahan" : "Terbitkan"}
          </button>
          <button type="submit" name="intent" value="draft" disabled={pending} className="btn-outline">
            {published ? "Jadikan draf" : "Simpan sebagai draf"}
          </button>
          <Link href="/admin/kisah" className="btn-quiet">Batal</Link>
        </div>
      </div>
    </form>
  );
}
