"use client";

import { useEffect, useRef, useState } from "react";
import { uploadImage } from "./ImageFields";

const BTN = "min-h-9 min-w-9 rounded px-2 text-sm font-medium hover:bg-sand focus-visible:bg-sand";

/**
 * Editor teks sederhana (tebal, miring, judul, daftar, kutipan, tautan, gambar).
 * Menghasilkan HTML pada input tersembunyi `name`; server menyanitasinya lagi sebelum disimpan.
 */
export function RichEditor({ name, initial }: { name: string; initial: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLInputElement>(null);
  const [html, setHtml] = useState(initial);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initial;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = () => setHtml(ref.current?.innerHTML ?? "");
  const cmd = (c: string, v?: string) => {
    ref.current?.focus();
    document.execCommand(c, false, v);
    sync();
  };

  async function insertImage(f?: File) {
    if (!f) return;
    setErr("");
    try {
      const url = await uploadImage(f);
      cmd("insertImage", url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal mengunggah.");
    } finally {
      if (img.current) img.current.value = "";
    }
  }

  const keep = (e: React.MouseEvent) => e.preventDefault(); // jaga seleksi teks saat menekan tombol

  return (
    <div>
      <input type="hidden" name={name} value={html} />
      <div role="toolbar" aria-label="Format teks" className="flex flex-wrap gap-0.5 rounded-t-md border border-b-0 border-stone/60 bg-sand/60 p-1">
        <button type="button" className={BTN} onMouseDown={keep} onClick={() => cmd("bold")} aria-label="Tebal"><b>B</b></button>
        <button type="button" className={BTN} onMouseDown={keep} onClick={() => cmd("italic")} aria-label="Miring"><i>I</i></button>
        <button type="button" className={BTN} onMouseDown={keep} onClick={() => cmd("formatBlock", "<h2>")}>Judul</button>
        <button type="button" className={BTN} onMouseDown={keep} onClick={() => cmd("formatBlock", "<h3>")}>Sub</button>
        <button type="button" className={BTN} onMouseDown={keep} onClick={() => cmd("formatBlock", "<p>")}>Paragraf</button>
        <button type="button" className={BTN} onMouseDown={keep} onClick={() => cmd("insertUnorderedList")}>• Daftar</button>
        <button type="button" className={BTN} onMouseDown={keep} onClick={() => cmd("insertOrderedList")}>1. Daftar</button>
        <button type="button" className={BTN} onMouseDown={keep} onClick={() => cmd("formatBlock", "<blockquote>")}>Kutipan</button>
        <button
          type="button"
          className={BTN}
          onMouseDown={keep}
          onClick={() => {
            const url = window.prompt("Alamat tautan (diawali https://)");
            if (url && /^(https?:\/\/|mailto:)/.test(url)) cmd("createLink", url);
          }}
        >
          Tautan
        </button>
        <button type="button" className={BTN} onMouseDown={keep} onClick={() => img.current?.click()}>Gambar</button>
        <button type="button" className={BTN} onMouseDown={keep} onClick={() => cmd("removeFormat")}>Bersihkan</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Isi kisah"
        data-placeholder="Mulai menulis kisah…"
        onInput={sync}
        onBlur={sync}
        onPaste={(e) => {
          // Tempel sebagai teks polos agar format dari Word/web tidak ikut masuk.
          e.preventDefault();
          document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
        }}
        className="editor prose-nada min-h-[320px] rounded-b-md border border-stone/60 bg-white/70 p-4 focus:border-deep focus:outline-none focus:ring-1 focus:ring-deep"
      />
      <input ref={img} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} onChange={(e) => insertImage(e.target.files?.[0])} />
      {err && <p role="alert" className="mt-2 text-sm">{err}</p>}
    </div>
  );
}
