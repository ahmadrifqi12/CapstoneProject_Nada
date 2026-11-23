import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ORDER_LABEL } from "@/lib/constants";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";

export const metadata = { title: "Detail pesanan" };

export default async function OrderAdminPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const o = await db.order.findUnique({ where: { code }, include: { items: true, user: { select: { name: true, email: true } } } });
  if (!o) notFound();

  return (
    <div className="max-w-5xl">
      <Link href="/admin/pesanan" className="link text-sm">← Semua pesanan</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl">{o.code}</h1>
          <p className="mt-1 text-sm text-muted">Dibuat {formatDateTime(o.createdAt)}</p>
        </div>
        <span className="tag !text-sm">{ORDER_LABEL[o.status]}</span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl">Item</h2>
            <ul className="mt-3 divide-y divide-sand border-y border-sand">
              {o.items.map((it) => (
                <li key={it.id} className="flex gap-4 py-3">
                  <div className="aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-sm bg-sand">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {it.image && <img src={it.image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{it.productName}</p>
                    <p className="text-muted">{it.colorName} · {it.size} · ×{it.qty} @ {formatRupiah(it.price)}</p>
                  </div>
                  <p className="text-sm">{formatRupiah(it.price * it.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatRupiah(o.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Ongkir</dt><dd>{formatRupiah(o.shippingFee)}</dd></div>
              <div className="flex justify-between text-base font-medium"><dt>Total</dt><dd>{formatRupiah(o.total)}</dd></div>
            </dl>
          </section>
          <section>
            <h2 className="text-2xl">Pembeli &amp; pengiriman</h2>
            <p className="mt-2 text-[15px]">{o.user.name} · <a className="link" href={`mailto:${o.user.email}`}>{o.user.email}</a></p>
            <p className="mt-3 text-[15px]">{o.recipient} · {o.phone}</p>
            <p className="text-[15px] text-muted">{o.address}, {o.city} {o.postalCode}</p>
          </section>
        </div>
        <aside className="card h-fit p-5">
          <OrderStatusForm code={o.code} status={o.status} trackingNumber={o.trackingNumber} />
        </aside>
      </div>
    </div>
  );
}
