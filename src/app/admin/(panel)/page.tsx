import Link from "next/link";
import { db } from "@/lib/db";
import { LOW_STOCK, ORDER_LABEL } from "@/lib/constants";
import { formatDateTime, formatRupiah } from "@/lib/format";

export const metadata = { title: "Ringkasan" };

export default async function DashboardPage() {
  const [pending, paid, lowStock, unread, recent, messages] = await Promise.all([
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "PAID" } }),
    db.productVariant.findMany({
      where: { stock: { lte: LOW_STOCK }, color: { product: { status: "ACTIVE" } } },
      include: { color: { include: { product: true } } },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    db.message.count({ where: { read: false } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { user: { select: { name: true } } } }),
    db.message.findMany({ where: { read: false }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  const stats = [
    { label: "Menunggu pembayaran", n: pending, href: "/admin/pesanan?status=PENDING" },
    { label: "Dibayar, perlu diproses", n: paid, href: "/admin/pesanan?status=PAID" },
    { label: "Stok menipis", n: lowStock.length, href: "/admin/produk" },
    { label: "Pesan belum dibaca", n: unread, href: "/admin/pesan" },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-4xl">Ringkasan</h1>
      <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="card block p-4 transition-colors duration-200 hover:border-deep">
              <span className="block font-serif text-4xl">{s.n}</span>
              <span className="mt-1 block text-sm text-muted">{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-2xl">Pesanan terbaru</h2>
          {recent.length === 0 ? <p className="mt-3 text-sm text-muted">Belum ada pesanan.</p> : (
            <ul className="mt-3 divide-y divide-sand border-y border-sand">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/pesanan/${o.code}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-sand/40">
                    <span>
                      <span className="block font-medium">{o.code}</span>
                      <span className="text-muted">{o.user.name} · {formatDateTime(o.createdAt)}</span>
                    </span>
                    <span className="text-right">
                      <span className="block">{formatRupiah(o.total)}</span>
                      <span className="tag mt-0.5">{ORDER_LABEL[o.status]}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-2xl">Stok menipis <span className="text-base text-muted">(≤ {LOW_STOCK})</span></h2>
          {lowStock.length === 0 ? <p className="mt-3 text-sm text-muted">Semua stok aman.</p> : (
            <ul className="mt-3 divide-y divide-sand border-y border-sand">
              {lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <Link href={`/admin/produk/${v.color.product.id}`} className="hover:text-deep">
                    {v.color.product.name} · {v.color.name} · {v.size}
                  </Link>
                  <span className={v.stock === 0 ? "badge" : "tag"}>{v.stock === 0 ? "Habis" : `Sisa ${v.stock}`}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {messages.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl">Pesan terbaru yang belum dibaca</h2>
          <ul className="mt-3 space-y-2">
            {messages.map((m) => (
              <li key={m.id} className="card p-4 text-sm">
                <p className="font-medium">{m.name} <span className="font-normal text-muted">· {m.email}</span></p>
                <p className="mt-1 line-clamp-2 text-muted">{m.body}</p>
              </li>
            ))}
          </ul>
          <Link href="/admin/pesan" className="link mt-3 inline-block text-sm">Buka semua pesan</Link>
        </section>
      )}
    </div>
  );
}
