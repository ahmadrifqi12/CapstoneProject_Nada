import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { midtransEnabled } from "@/lib/midtrans";
import { ORDER_LABEL } from "@/lib/constants";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { cancelMyOrder, startPayment } from "@/actions/shop";
import { ClearCart } from "@/components/ClearCart";
import { SubmitButton } from "@/components/ui";
import { SocialIcon } from "@/components/Icons";

export const metadata: Metadata = { title: "Detail pesanan", robots: { index: false } };

const STEPS = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DONE"];

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ baru?: string; galat?: string }>;
}) {
  const { code } = await params;
  const { baru, galat } = await searchParams;
  const user = await requireUser(`/akun/pesanan/${code}`);
  // Hanya pemilik pesanan yang dapat melihatnya.
  const order = await db.order.findFirst({ where: { code, userId: user.id }, include: { items: true } });
  if (!order) notFound();
  const s = await getSettings();

  const stepIdx = STEPS.indexOf(order.status);
  const cancelled = order.status === "CANCELLED";
  const waMsg = `Halo NADA, saya sudah transfer untuk pesanan ${order.code} sebesar ${formatRupiah(order.total)}. Berikut bukti transfernya.`;
  const waUrl = s.whatsapp ? `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(waMsg)}` : "";

  async function pay() {
    "use server";
    const r = await startPayment(code);
    if (r?.error) redirect(`/akun/pesanan/${code}?galat=${encodeURIComponent(r.error)}`);
  }
  const cancel = cancelMyOrder.bind(null, code);

  return (
    <div className="wrap pt-10">
      {baru && <ClearCart />}
      {baru && (
        <p role="status" className="mb-6 rounded-md border border-sage bg-sage/30 px-4 py-3">
          Pesanan berhasil dibuat. Silakan selesaikan pembayaran di bawah ini.
        </p>
      )}
      {galat && <p role="alert" className="mb-6 rounded-md border border-clay bg-clay/15 px-4 py-3 text-sm">{galat.slice(0, 200)}</p>}
      <Link href="/akun" className="link text-sm">← Semua pesanan</Link>
      <header className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="caps text-deep">Pesanan</p>
          <h1 className="mt-1 text-4xl sm:text-5xl">{order.code}</h1>
          <p className="mt-1 text-sm text-muted">Dibuat {formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`tag !text-sm ${cancelled ? "!bg-clay/30" : ""}`}>{ORDER_LABEL[order.status]}</span>
      </header>

      {!cancelled && (
        <ol className="mt-8 grid grid-cols-5 gap-2" aria-label="Progres pesanan">
          {STEPS.map((st, i) => (
            <li key={st} className="text-center">
              <div className={`h-1.5 rounded-full ${i <= stepIdx ? "bg-deep" : "bg-sand"}`} />
              <p className={`mt-2 text-[11px] leading-tight sm:text-xs ${i <= stepIdx ? "text-ink" : "text-muted"}`}>{ORDER_LABEL[st]}</p>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="text-2xl">Item</h2>
          <ul className="mt-3 divide-y divide-sand border-y border-sand">
            {order.items.map((it) => (
              <li key={it.id} className="flex gap-4 py-4">
                <div className="aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-sm bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {it.image && <img src={it.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{it.productName}</p>
                  <p className="text-muted">{it.colorName} · Ukuran {it.size} · ×{it.qty}</p>
                </div>
                <p className="text-sm">{formatRupiah(it.price * it.qty)}</p>
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-2xl">Pengiriman</h2>
          <p className="mt-2 text-[15px]">{order.recipient} · {order.phone}</p>
          <p className="text-[15px] text-muted">{order.address}, {order.city} {order.postalCode}</p>
          {order.trackingNumber && (
            <p className="mt-3 text-[15px]">Nomor resi: <strong className="font-medium">{order.trackingNumber}</strong></p>
          )}
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <dl className="space-y-2 text-[15px]">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatRupiah(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Ongkos kirim</dt><dd>{order.shippingFee === 0 ? "Gratis" : formatRupiah(order.shippingFee)}</dd></div>
              <div className="flex justify-between border-t border-sand pt-3 text-lg font-medium"><dt>Total</dt><dd>{formatRupiah(order.total)}</dd></div>
            </dl>
          </div>

          {order.status === "PENDING" && (
            <div className="card space-y-4 p-6">
              <h2 className="text-2xl">Pembayaran</h2>
              {midtransEnabled() ? (
                <form action={pay}>
                  <SubmitButton className="btn-primary w-full" pendingText="Mengalihkan…">Bayar sekarang</SubmitButton>
                  <p className="mt-2 text-xs text-muted">Kamu akan diarahkan ke halaman pembayaran Midtrans yang aman.</p>
                </form>
              ) : (
                <>
                  <p className="text-[15px]">Transfer sebesar <strong className="font-medium">{formatRupiah(order.total)}</strong> ke:</p>
                  <p className="whitespace-pre-line rounded-md bg-sand/70 p-3 text-[15px]">{s.bankInfo}</p>
                  {waUrl && (
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
                      <SocialIcon platform="whatsapp" width={18} height={18} /> Konfirmasi lewat WhatsApp
                    </a>
                  )}
                  <p className="text-xs text-muted">Pesanan diproses setelah pembayaran dikonfirmasi admin.</p>
                </>
              )}
              <form action={cancel}>
                <button className="btn-quiet w-full text-sm">Batalkan pesanan</button>
              </form>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
