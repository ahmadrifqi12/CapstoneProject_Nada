import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { deleteStory } from "@/actions/admin";

export const metadata = { title: "Kisah" };

export default async function StoriesAdminPage({ searchParams }: { searchParams: Promise<{ disimpan?: string }> }) {
  const { disimpan } = await searchParams;
  const stories = await db.story.findMany({ orderBy: { updatedAt: "desc" }, include: { products: { select: { id: true } } } });
  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-4xl">Kisah</h1>
        <Link href="/admin/kisah/baru" className="btn-primary">Tulis kisah</Link>
      </div>
      {disimpan && <p role="status" className="mt-4 rounded-md border border-sage bg-sage/30 px-4 py-2.5 text-sm">Kisah disimpan.</p>}
      {stories.length === 0 ? <p className="mt-10 text-muted">Belum ada kisah.</p> : (
        <ul className="mt-6 divide-y divide-sand border-y border-sand">
          {stories.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="aspect-[3/2] w-24 shrink-0 overflow-hidden rounded-sm bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {s.cover && <img src={s.cover} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-[180px] flex-1">
                <Link href={`/admin/kisah/${s.id}`} className="font-medium hover:text-deep">{s.title}</Link>
                <p className="text-sm text-muted">
                  {s.status === "PUBLISHED" ? `Terbit ${formatDate(s.publishedAt)}` : "Belum terbit"} · {s.products.length} produk terkait
                </p>
              </div>
              <span className={s.status === "PUBLISHED" ? "tag !bg-sage/60" : "tag"}>{s.status === "PUBLISHED" ? "Terbit" : "Draf"}</span>
              <div className="flex gap-1">
                {s.status === "PUBLISHED" && <Link href={`/kisah/${s.slug}`} target="_blank" className="btn-quiet !min-h-9">Lihat</Link>}
                <Link href={`/admin/kisah/${s.id}`} className="btn-quiet !min-h-9">Ubah</Link>
                <form action={deleteStory.bind(null, s.id)}><button className="btn-quiet !min-h-9">Hapus</button></form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
