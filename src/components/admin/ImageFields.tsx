"use client";

import { useRef, useState } from "react";
import { TrashIcon, PlusIcon } from "../Icons";

export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar.");
  return data.url as string;
}

/** Satu gambar (sampul kisah, hero). Nilainya dikirim lewat input tersembunyi bernama `name`. */
export function SingleImageField({
  name,
  initial = "",
  label,
  aspect = "aspect-[3/2]",
}: {
  name: string;
  initial?: string;
  label: string;
  aspect?: string;
}) {
  const [url, setUrl] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null);

  async function pick(f?: File) {
    if (!f) return;
    setBusy(true);
    setErr("");
    try {
      setUrl(await uploadImage(f));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal mengunggah.");
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  }

  return (
    <div>
      <p className="field-label">{label}</p>
      <input type="hidden" name={name} value={url} />
      <div className={`${aspect} max-w-md overflow-hidden rounded-md border border-dashed border-stone/60 bg-sand/50`}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted">Belum ada gambar</div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="btn-outline !min-h-9 !px-4 !py-1.5" disabled={busy} onClick={() => file.current?.click()}>
          {busy ? "Mengunggah…" : url ? "Ganti gambar" : "Unggah gambar"}
        </button>
        {url && <button type="button" className="btn-quiet !min-h-9" onClick={() => setUrl("")}>Hapus</button>}
      </div>
      <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} onChange={(e) => pick(e.target.files?.[0])} />
      {err && <p role="alert" className="mt-2 text-sm">{err}</p>}
    </div>
  );
}

/** Banyak foto dengan urutan yang bisa diatur (foto pertama menjadi foto utama kartu produk). */
export function MultiImageField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null);

  async function add(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr("");
    const added: string[] = [];
    try {
      for (const f of Array.from(files)) added.push(await uploadImage(f));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal mengunggah.");
    } finally {
      if (added.length) onChange([...value, ...added].slice(0, 10));
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  }

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <ul className="flex flex-wrap gap-3">
        {value.map((src, i) => (
          <li key={src} className="w-24">
            <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && <span className="badge absolute left-1 top-1">Utama</span>}
            </div>
            <div className="mt-1 flex items-center justify-between">
              <button type="button" aria-label={`Geser foto ${i + 1} ke kiri`} disabled={i === 0} onClick={() => move(i, -1)} className="grid size-8 place-items-center rounded hover:bg-sand disabled:opacity-30">←</button>
              <button type="button" aria-label={`Hapus foto ${i + 1}`} onClick={() => onChange(value.filter((_, k) => k !== i))} className="grid size-8 place-items-center rounded hover:bg-sand"><TrashIcon width={15} /></button>
              <button type="button" aria-label={`Geser foto ${i + 1} ke kanan`} disabled={i === value.length - 1} onClick={() => move(i, 1)} className="grid size-8 place-items-center rounded hover:bg-sand disabled:opacity-30">→</button>
            </div>
          </li>
        ))}
        {value.length < 10 && (
          <li className="w-24">
            <button type="button" disabled={busy} onClick={() => file.current?.click()} className="grid aspect-[3/4] w-full place-items-center rounded-md border border-dashed border-stone/60 text-xs text-muted transition-colors hover:border-deep hover:text-deep">
              <span className="flex flex-col items-center gap-1">
                <PlusIcon width={20} />
                {busy ? "Mengunggah…" : "Tambah foto"}
              </span>
            </button>
          </li>
        )}
      </ul>
      <input ref={file} type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} onChange={(e) => add(e.target.files)} />
      {err && <p role="alert" className="mt-2 text-sm">{err}</p>}
      <p className="mt-2 text-xs text-muted">JPG, PNG, atau WebP, maks. 8 MB. Disarankan rasio 3:4 dengan latar netral. Gambar otomatis diperkecil.</p>
    </div>
  );
}
