import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logout } from "@/actions/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [newOrders, unread] = await Promise.all([
    db.order.count({ where: { status: { in: ["PENDING", "PAID"] } } }),
    db.message.count({ where: { read: false } }),
  ]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-sand bg-sand/40 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-3 lg:block lg:px-6 lg:py-7">
          <Link href="/admin" className="font-serif text-3xl tracking-[0.16em]">NADA</Link>
          <p className="caps hidden text-muted lg:mt-1 lg:block">Panel admin</p>
        </div>
        <AdminNav badges={{ "/admin/pesanan": newOrders, "/admin/pesan": unread }} />
        <div className="hidden px-6 pb-6 pt-8 text-sm lg:absolute lg:bottom-0 lg:block lg:w-full">
          <p className="truncate text-muted">{admin.email}</p>
          <div className="mt-2 flex gap-3">
            <Link href="/" target="_blank" className="link">Lihat situs</Link>
            <form action={logout}><button className="link">Keluar</button></form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-8 sm:px-8 lg:px-10">{children}</div>
    </div>
  );
}
