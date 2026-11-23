import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { listActiveProducts, publishedStoryWhere, toCard } from "@/lib/catalog";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { StoryCard } from "@/components/StoryCard";
import { SocialIcon, ArrowIcon } from "@/components/Icons";

export default async function HomePage() {
  const [s, featured, stories] = await Promise.all([
    getSettings(),
    listActiveProducts({ featured: true, take: 8 }),
    // F6: tiga kisah terbit terbaru, otomatis menurut tanggal terbit.
    db.story.findMany({ where: publishedStoryWhere(), orderBy: { publishedAt: "desc" }, take: 3 }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-sand/50">
        <div className="wrap grid items-center gap-8 py-10 md:grid-cols-2 md:gap-14 md:py-16">
          <div className="order-2 md:order-1">
            <p className="caps text-deep">{s.siteName} · Abaya</p>
            <h1 className="mt-4 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">{s.heroTitle}</h1>
            <p className="mt-5 max-w-md text-[17px] text-muted">{s.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-primary">{s.heroCta}</Link>
              <Link href="/kisah" className="btn-outline">Baca kisahnya</Link>
            </div>
          </div>
          <div className="order-1 aspect-[4/3] overflow-hidden rounded-lg bg-sand md:order-2 md:aspect-[5/4]">
            {s.heroImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.heroImage} alt="Koleksi abaya NADA" width={1600} height={1000} fetchPriority="high" className="h-full w-full object-cover" />
            )}
          </div>
        </div>
      </section>

      {/* Teaser katalog */}
      <section className="wrap mt-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="caps text-deep">Pilihan kami</p>
            <h2 className="mt-2 text-4xl">Koleksi terpilih</h2>
          </div>
          <Link href="/shop" className="link hidden text-sm sm:inline">Lihat semua</Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-muted">Koleksi segera hadir.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {featured.map((p, i) => <ProductCard key={p.id} p={toCard(p)} priority={i < 4} />)}
          </div>
        )}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop" className="btn-outline">Lihat semua koleksi</Link>
        </div>
      </section>

      {/* Kisah terbaru */}
      {stories.length > 0 && (
        <section className="wrap mt-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="caps text-deep">Kisah terbaru</p>
              <h2 className="mt-2 text-4xl">Cerita di balik koleksi</h2>
            </div>
            <Link href="/kisah" className="link hidden text-sm sm:inline">Semua kisah</Link>
          </div>
          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {stories.map((st) => <StoryCard key={st.id} s={st} />)}
          </div>
        </section>
      )}

      {/* Media sosial */}
      {s.socials.length > 0 && (
        <section className="mt-24 bg-sand/50 py-16">
          <div className="wrap text-center">
            <p className="caps text-deep">Ikuti NADA</p>
            <h2 className="mt-2 text-4xl">Temui kami di media sosial</h2>
            <ul className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {s.socials.map((so) => (
                <li key={so.url + so.handle} className="card flex items-center gap-4 p-4 text-left">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sage/50 text-deep">
                    <SocialIcon platform={so.platform} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium capitalize">{so.platform}</span>
                    <span className="block truncate text-sm text-muted">{so.handle}</span>
                  </span>
                  <a href={so.url} target="_blank" rel="noopener noreferrer" className="btn-outline !min-h-9 !px-4 !py-1.5" aria-label={`Ikuti NADA di ${so.platform}`}>
                    Ikuti
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Ajakan */}
      <section className="wrap mt-24">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { href: "/shop", t: "Belanja", d: "Pilih warna, lihat langsung fotonya." },
            { href: "/kisah", t: "Baca Kisah", d: "Mengenal cerita di balik tiap koleksi." },
            { href: "/contact", t: "Hubungi Kami", d: "Tanya ukuran, bahan, atau pesananmu." },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="card group flex items-center justify-between p-6 transition-colors duration-200 hover:border-deep">
              <span>
                <span className="block font-serif text-3xl">{c.t}</span>
                <span className="mt-1 block text-sm text-muted">{c.d}</span>
              </span>
              <ArrowIcon className="text-deep transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
