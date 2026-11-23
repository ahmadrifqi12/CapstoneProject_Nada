"use client";

import Link from "next/link";
import { useActionState } from "react";
import { placeOrder } from "@/actions/shop";
import { useCart } from "./CartProvider";
import { useCartLines } from "./useCartLines";
import { FormMessage, SubmitButton } from "./ui";
import { formatRupiah } from "@/lib/format";

type Props = { defaultName: string; shippingFee: number; freeShippingMin: number };

export function CheckoutForm({ defaultName, shippingFee, freeShippingMin }: Props) {
  const [state, action] = useActionState(placeOrder, undefined);
  const { items } = useCart();
  const { lines, loading, subtotal, blocked } = useCartLines();

  if (loading) return <p className="mt-10 text-muted" role="status">Memuat…</p>;
  if (lines.length === 0) {
    return (
      <div className="mt-10 rounded-lg bg-sand/60 p-10 text-center">
        <p className="font-serif text-3xl">Tidak ada yang bisa di-checkout.</p>
        <Link href="/shop" className="btn-primary mt-6">Kembali belanja</Link>
      </div>
    );
  }

  const shipping = freeShippingMin > 0 && subtotal >= freeShippingMin ? 0 : shippingFee;

  return (
    <form action={action} className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <fieldset className="space-y-4">
        <legend className="mb-2 text-3xl font-serif">Alamat pengiriman</legend>
        <div>
          <label htmlFor="recipient" className="field-label">Nama penerima</label>
          <input id="recipient" name="recipient" defaultValue={state?.values?.recipient ?? defaultName} required autoComplete="name" className="input" />
        </div>
        <div>
          <label htmlFor="phone" className="field-label">Nomor telepon / WhatsApp</label>
          <input id="phone" name="phone" type="tel" defaultValue={state?.values?.phone} required autoComplete="tel" inputMode="tel" placeholder="08123456789" className="input" />
        </div>
        <div>
          <label htmlFor="address" className="field-label">Alamat lengkap</label>
          <textarea id="address" name="address" defaultValue={state?.values?.address} required rows={3} autoComplete="street-address" placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan" className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="field-label">Kota / kabupaten</label>
            <input id="city" name="city" defaultValue={state?.values?.city} required autoComplete="address-level2" className="input" />
          </div>
          <div>
            <label htmlFor="postalCode" className="field-label">Kode pos</label>
            <input id="postalCode" name="postalCode" defaultValue={state?.values?.postalCode} required inputMode="numeric" pattern="[0-9]{5}" maxLength={5} autoComplete="postal-code" className="input" />
          </div>
        </div>
      </fieldset>

      <aside className="card h-fit p-6">
        <h2 className="text-2xl">Ringkasan pesanan</h2>
        <ul className="mt-4 divide-y divide-sand">
          {lines.map((l) => (
            <li key={l.variantId} className="flex gap-3 py-3">
              <div className="aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-sm bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {l.image && <img src={l.image} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium">{l.name}</p>
                <p className="text-muted">{l.colorName} · {l.size} · ×{l.qty}</p>
              </div>
              <p className="text-sm">{formatRupiah(l.price * l.qty)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-sand pt-4 text-[15px]">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatRupiah(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Ongkos kirim</dt><dd>{shipping === 0 ? "Gratis" : formatRupiah(shipping)}</dd></div>
          <div className="flex justify-between border-t border-sand pt-3 text-lg font-medium"><dt>Total</dt><dd>{formatRupiah(subtotal + shipping)}</dd></div>
        </dl>
        <div className="mt-5 space-y-3">
          <FormMessage state={state} />
          {blocked && <p role="alert" className="text-sm">Ada item yang stoknya habis. <Link href="/cart" className="link">Perbarui keranjang</Link>.</p>}
          <SubmitButton className="btn-primary w-full" pendingText="Membuat pesanan…">Buat pesanan</SubmitButton>
          <p className="text-xs text-muted">Ongkos kirim memakai tarif tetap. Pembayaran dilakukan setelah pesanan dibuat.</p>
        </div>
      </aside>
    </form>
  );
}
