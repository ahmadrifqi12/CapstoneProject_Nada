"use client";

import { updateOrder } from "@/actions/admin";
import { FormMessage, useFormAction } from "../ui";
import { ORDER_LABEL, ORDER_STATUSES } from "@/lib/constants";

export function OrderStatusForm({ code, status, trackingNumber }: { code: string; status: string; trackingNumber: string }) {
  const { state, onSubmit, pending } = useFormAction(updateOrder.bind(null, code));
  const locked = status === "CANCELLED";
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="status" className="field-label">Status pesanan</label>
        <select id="status" name="status" defaultValue={status} disabled={locked} className="input">
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_LABEL[s]}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="trackingNumber" className="field-label">Nomor resi</label>
        <input id="trackingNumber" name="trackingNumber" defaultValue={trackingNumber} disabled={locked} className="input" placeholder="Wajib diisi saat status Dikirim" />
      </div>
      {locked && <p className="text-sm text-muted">Pesanan dibatalkan; stok sudah dikembalikan dan status tidak dapat diubah lagi.</p>}
      <FormMessage state={state} />
      {!locked && <button className="btn-primary w-full" disabled={pending}>{pending ? "Menyimpan…" : "Simpan"}</button>}
    </form>
  );
}
