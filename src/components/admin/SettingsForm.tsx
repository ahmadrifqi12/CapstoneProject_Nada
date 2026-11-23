"use client";

import { useState } from "react";
import { saveSettings } from "@/actions/admin";
import { FormMessage, useFormAction } from "../ui";
import { SingleImageField } from "./ImageFields";
import { PLATFORMS, PlusIcon, TrashIcon } from "../Icons";
import type { SiteSettings } from "@/lib/settings";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const { state, onSubmit, pending } = useFormAction(saveSettings);
  const [socials, setSocials] = useState(
    (initial.socials.length ? initial.socials : [{ platform: "instagram", handle: "", url: "" }]).map((s, i) => ({ ...s, k: i })),
  );
  const [nextKey, setNextKey] = useState(100);

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="card space-y-4 p-5 sm:p-6">
        <h2 className="text-2xl">Hero Beranda</h2>
        <div>
          <label htmlFor="heroTitle" className="field-label">Judul</label>
          <input id="heroTitle" name="heroTitle" defaultValue={initial.heroTitle} className="input" />
        </div>
        <div>
          <label htmlFor="heroSubtitle" className="field-label">Teks pendukung</label>
          <textarea id="heroSubtitle" name="heroSubtitle" defaultValue={initial.heroSubtitle} rows={2} className="input" />
        </div>
        <div>
          <label htmlFor="heroCta" className="field-label">Teks tombol</label>
          <input id="heroCta" name="heroCta" defaultValue={initial.heroCta} className="input max-w-xs" />
        </div>
        <SingleImageField name="heroImage" initial={initial.heroImage} label="Gambar hero" aspect="aspect-[5/4]" />
        <div>
          <label htmlFor="tagline" className="field-label">Slogan (footer)</label>
          <input id="tagline" name="tagline" defaultValue={initial.tagline} className="input" />
        </div>
      </section>

      <section className="card space-y-4 p-5 sm:p-6">
        <h2 className="text-2xl">Info kontak</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contactEmail" className="field-label">Email</label>
            <input id="contactEmail" name="contactEmail" type="email" defaultValue={initial.contactEmail} className="input" />
          </div>
          <div>
            <label htmlFor="contactPhone" className="field-label">Telepon (tampilan)</label>
            <input id="contactPhone" name="contactPhone" defaultValue={initial.contactPhone} className="input" />
          </div>
          <div>
            <label htmlFor="whatsapp" className="field-label">Nomor WhatsApp <span className="font-normal text-muted">(format 62…, tanpa tanda +)</span></label>
            <input id="whatsapp" name="whatsapp" inputMode="numeric" defaultValue={initial.whatsapp} className="input" placeholder="6281234567890" />
          </div>
          <div>
            <label htmlFor="hours" className="field-label">Jam layanan</label>
            <input id="hours" name="hours" defaultValue={initial.hours} className="input" />
          </div>
        </div>
        <div>
          <label htmlFor="address" className="field-label">Alamat</label>
          <textarea id="address" name="address" defaultValue={initial.address} rows={2} className="input" />
        </div>
      </section>

      <section className="card space-y-4 p-5 sm:p-6">
        <h2 className="text-2xl">Media sosial</h2>
        <ul className="space-y-3">
          {socials.map((s) => (
            <li key={s.k} className="grid gap-2 sm:grid-cols-[140px_1fr_1.4fr_auto]">
              <select name="social_platform" defaultValue={s.platform} aria-label="Platform" className="input">
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <input name="social_handle" defaultValue={s.handle} aria-label="Nama akun" placeholder="@nada.abaya" className="input" />
              <input name="social_url" defaultValue={s.url} aria-label="Tautan" placeholder="https://instagram.com/…" className="input" />
              <button type="button" aria-label="Hapus baris" className="btn-quiet" onClick={() => setSocials((x) => x.filter((y) => y.k !== s.k))}>
                <TrashIcon width={16} />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn-outline !min-h-10"
          onClick={() => {
            setSocials((x) => [...x, { platform: "instagram", handle: "", url: "", k: nextKey }]);
            setNextKey((n) => n + 1);
          }}
        >
          <PlusIcon width={16} /> Tambah platform
        </button>
      </section>

      <section className="card space-y-4 p-5 sm:p-6">
        <h2 className="text-2xl">Pengiriman &amp; pembayaran</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="shippingFee" className="field-label">Ongkos kirim tetap (Rp)</label>
            <input id="shippingFee" name="shippingFee" type="number" min={0} step={500} defaultValue={initial.shippingFee} className="input" />
          </div>
          <div>
            <label htmlFor="freeShippingMin" className="field-label">Gratis ongkir mulai belanja (Rp) <span className="font-normal text-muted">(0 = tidak ada)</span></label>
            <input id="freeShippingMin" name="freeShippingMin" type="number" min={0} step={1000} defaultValue={initial.freeShippingMin} className="input" />
          </div>
        </div>
        <div>
          <label htmlFor="bankInfo" className="field-label">Info rekening transfer <span className="font-normal text-muted">(tampil bila pembayaran online belum diaktifkan)</span></label>
          <textarea id="bankInfo" name="bankInfo" defaultValue={initial.bankInfo} rows={2} className="input" />
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 space-y-3 border-t border-sand bg-ivory/95 px-4 py-4 sm:mx-0 sm:px-0">
        <FormMessage state={state} />
        <button type="submit" disabled={pending} className="btn-primary">{pending ? "Menyimpan…" : "Simpan pengaturan"}</button>
      </div>
    </form>
  );
}
