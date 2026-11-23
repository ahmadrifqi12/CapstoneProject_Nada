import Link from "next/link";
import { db } from "@/lib/db";
import { ORDER_LABEL, ORDER_STATUSES } from "@/lib/constants";
import { formatDateTime, formatRupiah } from "@/lib/format";

export const metadata = { title: "Pesanan" };

export default async function OrdersAdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = (ORDER_STATUSES as readonly string[]).includes(status ?? "") ? status : undefined;
  const orders = await db.order.findMany({
    where: filter ? { status: filter } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true } }, items: true },
  });

  return (
    <div className="max-w-5xl">
      <h1 className="text-4xl">Pesanan</h1>
      <nav aria-label="Saring status" className="mt-5 flex flex-wrap gap-2">
        {[undefined, ...ORDER_STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/admin/pesanan?status=${s}` : "/admin/pesanan"}
            aria-current={filter === s ? "true" : undefined}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${filter === s ? "border-deep bg-deep text-white" : "border-stone/50 hover:border-deep"}`}
          >
            {s ? ORDER_LABEL[s] : "Semua"}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? <p className="mt-10 text-muted">Tidak ada pesanan.</p> : (
        <ul className="mt-6 divide-y divide-sand border-y border-sand">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/pesanan/${o.code}`} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm hover:bg-sand/40">
                <span>
                  <span className="block font-medium">{o.code}</span>
                  <span className="text-muted">{o.user.name} · {formatDateTime(o.createdAt)} · {o.items.reduce((n, i) => n + i.qty, 0)} item</span>
                </span>
                <span className="flex items-center gap-4">
                  <span className="tag">{ORDER_LABEL[o.status]}</span>
                  <span className="w-28 text-right font-medium">{formatRupiah(o.total)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
