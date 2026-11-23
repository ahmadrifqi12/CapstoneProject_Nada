import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap max-w-xl py-28 text-center">
      <p className="caps text-deep">404</p>
      <h1 className="mt-3 text-5xl">Halaman tidak ditemukan</h1>
      <p className="mt-4 text-muted">Tautan yang kamu buka mungkin sudah berubah atau produknya tidak lagi dijual.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="btn-primary">Ke Beranda</Link>
        <Link href="/shop" className="btn-outline">Lihat koleksi</Link>
      </div>
    </div>
  );
}
