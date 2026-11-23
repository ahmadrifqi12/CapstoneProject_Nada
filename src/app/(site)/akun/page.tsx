import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { logout } from "@/actions/auth";
import { ORDER_LABEL } from "@/lib/constants";
import { formatDate, formatRupiah } from "@/lib/format";

export const metadata: Metadata = { title: "Akun saya", robots: { index: false } };

export default async function AccountPage() {
  const user = await requireUser("/akun");
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="wrap pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="caps text-deep">Akun</p>
          <h1 className="mt-2 text-5xl">Halo, {user.name.split(" ")[0]}</h1>
          <p className="mt-2 text-muted">{user.email}</p>
        </div>
        <form action={logout}><button className="btn-outline">Keluar</button></form>
      </header>

      <h2 className="mt-12 text-3xl">Riwayat pesanan</h2>
      {orders.length === 0 ? (
        <div className="mt-6 rounded-lg bg-sand/60 p-8 text-center">
          <p className="font-serif text-2xl">Belum ada pesanan.</p>
          <Link href="/shop" className="btn-primary mt-5">Mulai belanja</Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/akun/pesanan/${o.code}`} className="card flex flex-wrap items-center justify-between gap-3 p-5 transition-colors duration-200 hover:border-deep">
                <span>
                  <span className="block font-medium">{o.code}</span>
                  <span className="text-sm text-muted">{formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.qty, 0)} item</span>
                </span>
                <span className="flex items-center gap-4">
                  <span className="tag">{ORDER_LABEL[o.status]}</span>
                  <span className="text-sm font-medium">{formatRupiah(o.total)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
